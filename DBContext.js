import React, { createContext, useContext } from 'react';
import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'deudat.db';
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

export {DATABASE_NAME}