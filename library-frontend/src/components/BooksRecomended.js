import React from "react";
import { useQuery } from "@apollo/client";

import { BOOKS_QUERY, CURRENT_USER } from "../gql/queries";

const BooksRecomended = ({ show }) => {
  const current_user = await useQuery(CURRENT_USER, { skip: !show });

  var genre;

  if (current_user.data) {
    console.log ('no skip')
    genre = current_user.data.me.favoriteGenre;
  }


  const result = await useQuery(BOOKS_QUERY, { variables: { genre }, skip: !show });

  if (!show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  var books = result.data.allBooks;

  return (
    <div>
      <h2>Recomendations</h2>
      <p>your favorite genre: {genre}</p>

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
    </div>
  );
};

export default BooksRecomended;
