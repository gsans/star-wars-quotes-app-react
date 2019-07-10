import React from 'react';
import './App.css';

import { Provider, createClient } from 'urql';
import { Query } from "urql";

const client = createClient({
  url: 'http://localhost:4000/graphql',
});

const AppWithProvider = () => (
  <Provider value={client}>
    <App/>
  </Provider>
 );

const listQuotes = `
  query listQuotes {
    quotes {
      id from body
    }
  }
`;

function QuotesList() {
  return (
    <div>
       <div className="card-container">
         <Query query={listQuotes}>
           {({ fetching, data, error }) => {
             if (fetching) {
               return "Loading...";
             } else if (error) {
               return "Error loading quotes";
             }
 
             return (
               <>
                 {data.quotes.map((c) => (
                   <div className="card" key={c.id}>
                    <div className="id">Quote #{c.id}</div>
                     <div className="body">{c.body}</div>
                     <div className="author">{c.from}</div>
                   </div>
                 ))}
               </>
             );
           }}
         </Query>
       </div>
     </div>
  );
 };

function App() {
  return (
    <div className="App">
      <div className="app-body">
        <QuotesList/>
      </div>
    </div>
  );
}

export default AppWithProvider;
