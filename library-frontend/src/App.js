import React, { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import BooksRecomended from "./components/BooksRecomended";
import LoginForm from "./components/LoginForm";
import NewBook from "./components/NewBook";

const App = () => {
  const [page, setPage] = useState("authors");
  const [userToken, setUserToken] = useState("");

  const setUser = (token) => {
    setUserToken(token);
    setPage("authors");
  };

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

      <NewBook show={page === "add"} />

      <LoginForm show={page === "login"} setUser={setUser}/>
    </div>
  );
};

export default App;
