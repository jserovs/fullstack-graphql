import React, { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import BooksRecomended from "./components/BooksRecomended";
import LoginForm from "./components/LoginForm";
import NewBook from "./components/NewBook";

import { BOOK_ADDED, BOOKS_QUERY } from "./gql/queries";

import { useSubscription, useApolloClient } from "@apollo/client";

const App = () => {
  const [page, setPage] = useState("authors");
  const [userToken, setUserToken] = useState("");

  const setUser = (token) => {
    setUserToken(token);
    setPage("authors");
  };

  const client = useApolloClient();

  function updateCacheWith(bookInfo) {
    console.log(JSON.stringify(bookInfo))    
    const dataInStore = client.readQuery({ query: BOOKS_QUERY });
    console.log(JSON.stringify(dataInStore))

    const exists = dataInStore.allBooks.find(elem => elem.title === bookInfo.title)

    if (!exists) {
      client.writeQuery({
        query: BOOKS_QUERY,
        data: { allBooks : dataInStore.allBooks.concat(bookInfo) }
      })
    }
    
  }

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      window.alert(
        "New book have been added:" +
          subscriptionData.data.bookAdded.title +
          " by " +
          subscriptionData.data.bookAdded.author.name +
          "!"
      );
      updateCacheWith(subscriptionData.data.bookAdded);
    },
  });

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>authors</button>
        <button onClick={() => setPage("books")}>books</button>
        {userToken && <button onClick={() => setPage("add")}>add book</button>}
        {userToken && (
          <button onClick={() => setPage("recomended")}>recomended</button>
        )}
        {userToken && (
          <button
            onClick={() => {
              setUserToken();
              setPage("authors");
            }}
          >
            logOut
          </button>
        )}
        {!userToken && <button onClick={() => setPage("login")}>login</button>}
      </div>

      <Authors show={page === "authors"} user={userToken} />

      <Books show={page === "books"} />

      <BooksRecomended show={page === "recomended"} />

      <NewBook show={page === "add"} updateCacheWith={updateCacheWith} />

      <LoginForm show={page === "login"} setUser={setUser} />
    </div>
  );
};

export default App;
