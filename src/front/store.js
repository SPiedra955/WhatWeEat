export const initialStore = () => {
  return {
    auth: !!localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user")) || null,
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {

    case "logout":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...store,
        auth: false,
        user: null,
      };

    case "auth":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...store,
        auth: true,
        user: action.payload.user,
      };

    case "set_hello":
      return {
        ...store,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;

      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo,
        ),
      };
    default:
      throw Error("Unknown action.");
  }
}
