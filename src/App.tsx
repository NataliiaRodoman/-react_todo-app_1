/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Todo } from './types/Todo';
import { FilterBy, ErrorMessage } from './types/Constants';
import { createTodo, deleteTodo, getTodos } from './api/todos';
import { RequestTodo } from './types/RequestTodo';
import { client } from './utils/fetchClient';
import { Header } from './Components/Header';
import { TodoList } from './Components/TodoList';
import { Footer } from './Components/Footer';
import { ErrorModal } from './Components/ErrorModal';

const USER_ID = 10552;

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const [querySearch, setQuerySearch] = useState('');
  const [filterBy, setFilterBy] = useState<FilterBy>(FilterBy.ALL);

  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      switch (filterBy) {
        case FilterBy.ACTIVE:
          return !todo.completed;
        case FilterBy.COMPLETED:
          return todo.completed;
        case FilterBy.ALL:
        default:
          return todo;
      }
    });
  }, [filterBy, todos]);

  const getTodosServer = async () => {
    try {
      const arrayTodos = await getTodos(USER_ID);

      setTodos(arrayTodos);
    } catch (error) {
      setErrorMessage(ErrorMessage.DownloadError);
    }
  };

  useEffect(() => {
    getTodosServer();
  }, []);

  const addTodo = async () => {
    const newTodo: RequestTodo = {
      userId: USER_ID,
      completed: false,
      title: querySearch,
    };

    try {
      if (!querySearch.trim()) {
        return;
      }

      await createTodo(USER_ID, newTodo);

      setTempTodo({
        id: 0,
        ...newTodo,
      });

      await getTodosServer();
    } catch (error) {
      setErrorMessage(ErrorMessage.NotAdded);
    } finally {
      setTempTodo(null);
    }
  };

  const handleDeleteTodo = async (todoId: number) => {
    try {
      const filtTodos = todos.filter(todo => todo.id !== todoId);

      setTodos(filtTodos);
      await deleteTodo(todoId);
      await getTodosServer();
    } catch (error) {
      setErrorMessage(ErrorMessage.NotDeleted);
    }
  };

  const deleteTodoCompleted = async () => {
    todos.filter(todo => todo.completed)
      .forEach(todo => handleDeleteTodo(todo.id));
  };

  const onUpdate = async (id: number) => {
    const updatedTodos = todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          completed: !todo.completed,
        };
      }

      return todo;
    });

    setTodos(updatedTodos);
    try {
      const todoToUpdate = todos.find((todo) => todo.id === id);

      if (todoToUpdate) {
        await client.patch(`/todos/${id}`, {
          completed: !todoToUpdate.completed,
          title: todoToUpdate.title,
          userId: USER_ID,
          id,
        });
      }
    } catch (error) {
      setErrorMessage(ErrorMessage.Issue);
    }
  };

  const updateTodo = (
    todoId: number,
    property: Partial<Todo>,
  ) => {
    return client.patch(`/todos/${todoId}`, property);
  };

  const updateTodoTitle = useCallback(
    async (
      id: number,
      property: Partial<Todo>,
    ) => {
      try {
        if (property.title === '') {
          return;
        }

        await updateTodo(id, property);
        getTodosServer();
      } catch (error) {
        setErrorMessage(ErrorMessage.NotUpdated);
      }
    }, [],
  );

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  const isAllTodosCompleted = useMemo(() => (
    todos.every(todo => todo.completed)
  ), [todos]);

  const selectAllTodos = useCallback(async () => {
    try {
      await Promise.all(todos.map(todo => (
        onUpdate(todo.id))));

      setTodos(todos.map(todo => (
        { ...todo, completed: !isAllTodosCompleted }
      )));
    } catch (error) {
      setErrorMessage(ErrorMessage.NotUpdated);
    }
  }, [todos]);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          querySearch={querySearch}
          setQuerySearch={setQuerySearch}
          handleAddTodo={addTodo}
          selectAllTodos={selectAllTodos}
          isAllTodosCompleted={isAllTodosCompleted}
        />

        <TodoList
          todos={filteredTodos}
          onDelete={handleDeleteTodo}
          tempTodo={tempTodo}
          onChange={updateTodoTitle}
        />
        {todos.length > 0 && (
          <Footer
            todosShow={filteredTodos}
            filterBy={filterBy}
            setFilterBy={setFilterBy}
            deleteTodoCompleted={deleteTodoCompleted}
          />
        )}
      </div>

      {errorMessage && (
        <ErrorModal
          onClose={handleCloseError}
          error={errorMessage}
          onErrorChange={setErrorMessage}
        />
      )}
    </div>
  );
};
