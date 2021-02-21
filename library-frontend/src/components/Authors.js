import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { useMutation } from "@apollo/client";

import { ALL_AUTHORS, CHANGE_AUTHOR } from "../gql/queries";

const Authors = ({show, user}) => {
  const [birthYear, setBirthYear] = useState("");
  const [authorSelected, setAuthorSelected] = useState();

  const result = useQuery(ALL_AUTHORS);

  const [changeAuthor] = useMutation(CHANGE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  if (!show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  // console.log(result.data.allAuthors)
  const authors = result.data.allAuthors;

  const yearChange = (event) => {
    setBirthYear(event.target.value);
  };

  const submit = async (event) => {
    event.preventDefault();

    changeAuthor({
      variables: { name: authorSelected, born: parseInt(birthYear) },
    });
  };

  const selectValueChange = (event) => {
    if (!event.target.value) {
      return;
    }
    const authName = event.target.value;

    const authSelected = authors.find((a) => a.name === authName);
    setBirthYear(!authSelected.born ? "" : authSelected.born);
    setAuthorSelected(authName);
  };

  const authorEditForm = () => {
    return (
      <div>
        <h3>Set Birthday</h3>
        <div>
          <form onSubmit={submit}>
            <div>
              author:
              <select onChange={selectValueChange} value={authorSelected}>
                <option key="empty" value=""></option>
                {authors.map((a, index) => (
                  <option key={index} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              Year
              <input type="number" value={birthYear} onChange={yearChange} />
            </div>
            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {user && authorEditForm()}
    </div>
  );
};

export default Authors;
