require("dotenv").config();

const { ApolloServer, UserInputError, gql } = require("apollo-server");
const { v1: uuid } = require("uuid");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const Author = require("./models/Author");
const Book = require("./models/Book");
const User = require("./models/User");
const url = process.env.MONGODB_URI;
const JWT_SECRET = "JWT_SECRET";

mongoose.connect(url, { useNewUrlParser: true });

console.log("connected to Mongo");

let authors = [
  {
    name: "Robert Martin",
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: "Martin Fowler",
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963,
  },
  {
    name: "Fyodor Dostoevsky",
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821,
  },
  {
    name: "Joshua Kerievsky", // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: "Sandi Metz", // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
];

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "The Demon ",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
];

const typeDefs = gql`
  type Book {
    title: String!
    published: Int!
    author: String!
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book!

    editAuthor(name: String!, setBornTo: Int): Author

    createUser(username: String!, favoriteGenre: String!): User

    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => {
      const res = await Book.find({});
      return res.length;
    },
    authorCount: async () => {
      const res = await Author.find({});
      return res.length;
    },
    allBooks: async (parent, args) => {
      if (args.genre !== undefined) {
        return await Book.find({ genres: { $in: [args.genre] } });
      }

      // if (args.author !== undefined) {
      //   res = res.filter((book) => {
      //     return book.author === args.author;
      //   });
      // }

      const booksFromDb = await Book.find({});

      return booksFromDb;
    },
    allAuthors: async () => await Author.find({}),
    me: () => {},
  },
  Author: {
    bookCount: async (parent) => {
      const booksFromDb = await Book.find({});
      return booksFromDb.filter(
        (book) => book.author.toString() === parent._id.toString()
      ).length;
    },
  },
  Mutation: {
    addBook: async (root, args) => {
      if (args.title.length < 3) {
        throw new UserInputError("Book Title should be more than 3 char long", {
          invalidArgs: args.title,
        });
      }

      if (args.author.length < 1) {
        throw new UserInputError(
          "Book Author should be more than 3 char long",
          {
            invalidArgs: args.author,
          }
        );
      }
      const book = { ...args, id: uuid() };
      var authId;

      const bookAuthor = await Author.findOne({ name: book.author });

      if (!bookAuthor) {
        const newBookAuthor = new Author({
          name: book.author,
        });
        const mongoRes = await newBookAuthor.save();
        authId = mongoRes._id;
      } else {
        authId = bookAuthor._id;
      }
      const newBook = new Book({
        title: book.title,
        published: parseInt(book.published),
        author: authId,
        genres: book.genres,
      });

      const mongoRes = await newBook.save();

      return newBook;
    },
    editAuthor: async (root, args) => {
      const filter = { name: args.name };
      const update = { born: args.setBornTo };

      const auth = await Author.findOneAndUpdate(filter, update, {
        new: true,
      });

      if (!auth) {
        return null;
      }

      return auth;
    },
    login: async (root, args) => {
      const userName = args.username;
      const password = args.password;
      const user = await User.findOne({ username: args.username });
      console.log(user);

      if (!user) {
        throw new UserInputError("Wrong username", {
          invalidArgs: args.username,
        });
      }
      if (user.password !== password) {
        throw new UserInputError("Wrong password", {
          invalidArgs: args.password,
        });
      }

      if (user.password == password) {
        return { value: jwt.sign(user.username, JWT_SECRET) };
      }
    },
    createUser: async (root, args) => {
      const userName = args.username;
      const favoriteGenre = args.favoriteGenre;

      if (userName.length < 2) {
        throw new UserInputError("Username should be atleast 2 char long", {
          invalidArgs: args.username,
        });
      }

      // if (!password || password < 8) {
      //   throw new UserInputError("Password should be atleast 8 char long", {
      //     invalidArgs: args.password,
      //   });
      // }

      const newUser = new User({ username: userName, favoriteGenre: favoriteGenre, password: "password" });


      await newUser.save();

      return newUser
    },
  },
};

const users = [
  { username: "tester", password: "testerPasssword" },
  { username: "admin", password: "adminPasssword" },
];

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
