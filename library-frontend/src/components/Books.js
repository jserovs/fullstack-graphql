import React, {useState} from "react";
import { useQuery } from "@apollo/client";

import { BOOKS_QUERY } from "../gql/queries"

const Books = (props) => {
  const result = useQuery(BOOKS_QUERY);

  const [genreFilter, setGenreFilter] = useState('')

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  var books = result.data.allBooks;

  const getGenres = (books) => {
    const genreSet = new Set();
    books.forEach(book => {
      book.genres.forEach(genre => {
        genreSet.add(genre)
      })
    });

    return Array.from(genreSet)
  }

  const genres = getGenres(books)

  if (genreFilter!=='') {
    books = books.filter((book)=>book.genres.includes(genreFilter))
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p></p>
      <button key='all' onClick={() => {setGenreFilter('')}}>All</button>
      {genres.map((genre) => (<button key={genre} onClick={() => {setGenreFilter(genre)}}>{genre}</button>))}
    </div>
  );
};

export default Books;
