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

const apiurl = 'http://192.168.1.21:3000'

export {apiurl}