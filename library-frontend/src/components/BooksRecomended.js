import React, { useEffect, useState } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";

import { BOOKS_QUERY, CURRENT_USER } from "../gql/queries";

const BooksRecomended = ({ show }) => {
  const current_user = useQuery(CURRENT_USER, { skip: !show });

  const [recomendedBooks, setRecomendedBooks] = useState([]);

  var genre;

  if (current_user.data) {
    genre = current_user.data.me.favoriteGenre;
  }

  const [getRecomendedBooks, { loading }] = useLazyQuery(BOOKS_QUERY, {
    variables: { genre },
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      setRecomendedBooks(data.allBooks);
    },
  });

  useEffect(() => {
    if (!show || !genre) return;
    getRecomendedBooks();

  }, [show, genre]);


  if (!show) {
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }

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
          {recomendedBooks.map((book) => (
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
