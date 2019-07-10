import React from 'react';
import './App.css';

import { Provider, createClient } from 'urql';
import { Query } from "urql";

import { SubscriptionClient } from 'subscriptions-transport-ws';
import {
  cacheExchange,
  debugExchange,
  fetchExchange,
  subscriptionExchange,
} from 'urql';

import { Subscription } from 'urql';
import { useSubscription } from 'urql';

const subscriptionClient = new SubscriptionClient(
  'ws://localhost:4001/graphql',
  {}
);

const client = createClient({
  url: 'http://localhost:4000/graphql',
  exchanges: [
    debugExchange,
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription: operation => subscriptionClient.request(operation),
    }),
  ],
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

const newQuote = `
  subscription newQuotesSubs {
    newQuote {
      id from body
    }
  }
`;

function LatestQuotes({limit = 2}) {
  if (limit<1) limit = 1;
  const quotesReducer = (state = [], response) => {
    return [response.newQuote, ...state.slice(0, limit-1)];
  }

  const [res] = useSubscription({ query: newQuote }, quotesReducer);

  if (res.error !== undefined) {
    return (<div>Error</div>);
  }

  if (res.data === undefined) {
    return (<p>Waiting for new quote...</p>);
  }

  return (
    <div className="card-container">
      {res.data.map((q) => (
        <div className="card" key={q.id}>
        <div className="id">Quote #{q.id}</div>
          <div className="body">{q.body}</div>
          <div className="author">{q.from}</div>
        </div>
      ))}
    </div>
  );
};

function LatestQuote() {
  return (
    <div>
      <Subscription query={newQuote}>
        {({ data }) => {
          if (!data) {
            return (<p>Waiting for new quote...</p>);
          }
          const q = data.newQuote;
          return (
          <div className="card-container">
            {(
              <div className="card" key={q.id}>
                <div className="id">Quote #{q.id}</div>
                <div className="body">{q.body}</div>
                <div className="author">{q.from}</div>
              </div>
            )}
            </div>
          )
        }}
      </Subscription>
    </div>
  );
 };

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
                 {data.quotes.map((q) => (
                   <div className="card" key={q.id}>
                    <div className="id">Quote #{q.id}</div>
                     <div className="body">{q.body}</div>
                     <div className="author">{q.from}</div>
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
        <LatestQuotes limit="3"/>
      </div>
    </div>
  );
}

export default AppWithProvider;
