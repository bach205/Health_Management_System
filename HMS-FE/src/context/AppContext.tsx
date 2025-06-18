import { createContext } from "react";
import { doctors } from "../assets/assets";


interface AppContextType {
  doctors: any[];
  currencySymbol: string;
}


interface AppContextProviderProps {
  children: React.ReactNode;
}

const defaultValue: AppContextType = {
  doctors: doctors,
  currencySymbol: '₹'
};

export const AppContext = createContext<AppContextType>(defaultValue);

const AppContextProvider = (props: AppContextProviderProps) => {
  return(
    <AppContext.Provider value={defaultValue}>
      {props.children}
    </AppContext.Provider>
  )
}

export default AppContextProvider