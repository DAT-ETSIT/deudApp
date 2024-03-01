import React, { createContext, useContext } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('pg.db');

const DBContext = createContext();

export const useDB = () => useContext(DBContext);

export const DBProvider = ({ children }) => {
  return (
    <DBContext.Provider value={db}>
      {children}
    </DBContext.Provider>
  );
};