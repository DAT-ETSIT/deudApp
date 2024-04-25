import React, { createContext, useContext } from 'react';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'deudat3.db';
const db = SQLite.openDatabase(DATABASE_NAME);
const DBContext = createContext();
export const useDB = () => useContext(DBContext);

export const DBProvider = ({ children }) => {
    return (
      <DBContext.Provider value={db}>
        {children}
      </DBContext.Provider>
    );
  };

export const getSessionToken = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql('CREATE TABLE IF NOT EXISTS session (id INTEGER PRIMARY KEY, sessionToken TEXT)');
      tx.executeSql('SELECT sessionToken FROM session WHERE id=1', null, (_, resultSet) => {
        if (resultSet.rows.length === 0) {
          reject(new Error('No session token found'));
        } else {
          const sessionToken = resultSet.rows.item(0).sessionToken;
          resolve(sessionToken);
        }
      },
      (_, error) => {
        reject(error);
      });
    });
  });
};

const apiurl = 'http://192.168.1.21:3000'

export {apiurl}