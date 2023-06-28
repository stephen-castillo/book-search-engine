import { gql } from "@apollo/client";

export const GET_ME = gql`
  query Query {
    me {
      _id
      savedBooks {
        _id
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;
