import styles from "./App.module.css";
import List from "./components/List";
import InputWithLabel from "./components/InputWithLabel";
import logo from "./assets/logo.png";
import usePersistence from "./hooks/usePersistence";
import React, {
  useEffect,
  useState,
  useMemo,
  useReducer,
  useCallback,
  createContext,
} from "react";
import axios from "axios";
import { Box } from "@mui/system";
import { useDebounce } from "./hooks/useDebounce";
import { StateType, StoryType, ActionType } from "./types";
import { Link, Navigate } from "react-router-dom";
import { Button, Paper } from "@mui/material";
import Pagination from "./components/Pagination";
import Pages from "./Pages.json";
import "./App.css";

export const title: string = "React Training";

export function storiesReducer(state: StateType, action: ActionType) {
  switch (action.type) {
    case "SET_STORIES":
      return { data: action.payload.data, isError: false, isLoading: false };
    case "INIT_FETCH":
      return { ...state, isLoading: true, isError: false };
    case "FETCH_FAILURE":
      return { ...state, isLoading: false, isError: true };
    case "REMOVE_STORY":
      const filteredState = state.data.filter(
        (story: any) => story.objectID !== action.payload.id
      );
      return { data: filteredState, isError: false, isLoading: false };
    default:
      return state;
  }
}

const API_ENDPOINT = "https://hn.algolia.com/api/v1/search?query=";
const API_URL = "https://hn.algolia.com/api/v1/search?page=";
interface AppContextType {
  onClickDelete: (e: number) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

function App(): JSX.Element {
  const [searchText, setSearchText] = usePersistence("searchTerm", "React");
  const [currentPage, setCurrentPage] = useState(1);

  const [postsPerPage] = useState(10);

  /*extra code */
  const [Click, setClick] = useState(false);
  /*extra code*/

  const NavigatePage = useDebounce(API_URL + currentPage);
  const debouncedUrl = useDebounce(API_ENDPOINT + searchText);

  const [stories, dispatchStories] = useReducer(storiesReducer, {
    data: [],
    isError: false,
    isLoading: false,
  });

  const sumOfComments = useMemo(
    () =>
      stories.data.reduce(
        (acc: number, current: StoryType) => acc + current.num_comments,
        0
      ),
    [stories]
  );

  const handleFetchStories = useCallback(async () => {
    dispatchStories({ type: "INIT_FETCH" });
    try {
      const response = await axios.get(debouncedUrl);
      dispatchStories({
        type: "SET_STORIES",
        payload: { data: response.data.hits },
      });
    } catch {
      dispatchStories({ type: "FETCH_FAILURE" });
    }
  }, [debouncedUrl]);


  const handlePageURL = useCallback(async () => {
    dispatchStories({ type: "INIT_FETCH" });
    try {
      const response = await axios.get(NavigatePage);
      dispatchStories({
        type: "SET_STORIES",
        payload: { data: response.data.hits },
      });
    } catch {
      dispatchStories({ type: "FETCH_FAILURE" });
    }
  }, [NavigatePage]);



  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);

  useEffect(() => {
    handlePageURL();
  }, [handlePageURL]);


  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  function handlePage(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(event.target.value);
  }

  const handleDeleteClick = useCallback((objectId: number) => {
    console.log("Delete click captured", objectId);
    dispatchStories({ type: "REMOVE_STORY", payload: { id: objectId } });
  }, []);

  if (stories.isError) {
    return (
      <h1 style={{ marginTop: "10rem", color: " red" }}>
        Something went wrong
      </h1>
    );
  }
  if (Click) {
    return (
      <div>
        <pre>{JSON.stringify(stories.data, null, 2)}</pre>
      </div>
    )
  }
  else {
    return (
      <div>
        <nav>
          <div className={styles.heading}>
            <h1>{title}</h1>
            <img src={logo} />
          </div>
          <p>Sum: {sumOfComments}</p>
          <InputWithLabel
            searchText={searchText}
            onChange={handleChange}
            id="searchBox"
          >
            Search
          </InputWithLabel>
          <Link to="/login" state={{ id: "1234" }}>
            <h6>Login</h6>
          </Link>
        </nav>
        {stories.isLoading ? (
          <h1 style={{ marginTop: "10rem" }}>Loading</h1>
        ) : (
          <div>
            <AppContext.Provider value={{ onClickDelete: handleDeleteClick }}>
              <List listOfItems={stories.data} />
            </AppContext.Provider>

            <Box
              display="flex"
              marginTop="5rem"
              justifyContent="flex-end"
              padding="10px"
            >

              {Pages.map((page, index) => (
                <Pagination onClick={() => setCurrentPage(index + 1)} index={index + 1}
                  postsPerPage={postsPerPage} variant="outlined" color="primary" />
              ))}
            </Box>


          </div>
        )}




      </div>
    );
  }//closing of else
}

export default App;