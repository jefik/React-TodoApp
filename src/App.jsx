import React, { useState, useEffect } from "react";
import supabase from "./helper/supabaseClient";
import TodoColumn from "./components/TodoColumn";
import Background from "./components/Background";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState(null);
  const [editDeadline, setEditDeadline] = useState("");
  const [titleError, setTitleError] = useState("");
  const [editTitleError, setEditTitleError] = useState("");

  // VALIDATION FUNC FOR TODO TITLES
  const validateTitle = (value) => {
    if (!value.trim()) return "Task title is required.";
    if (value.length > 64) return "Title cannot exceed 64 characters.";

    const pattern = /^[\p{L}0-9 _-]*$/u;
    if (!pattern.test(value)) {
      return "Only letters, numbers, spaces, - and _ are allowed.";
    }

    return "";
  };
  // HANDLERS FOR INPUT CHANGES
  // HANDLER FOR ADD TODO TITLE INPUT CHANGE
  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setTitleError(""); // clear error when typing
  };
  // HANDLER FOR EDIT TODO TITLE INPUT CHANGE
  const handleEditTitleChange = (e) => {
    setEditTitle(e.target.value);
    setEditTitleError(""); // clear error when typing
  };
  // HANDLER FOR CLICKING EDIT BUTTON
  const handleEditClick = (todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title ?? "");
    setEditDeadline(formatDate(todo.deadline));
    // RESET ERROR ON OPEN
    setEditTitleError("");
  };
  // FUNC TO GET CSS CLASS BASED ON STATUS
  const getStatusClass = (status) => {
    if (status === "incomplete") return "status-incomplete";
    if (status === "stopped") return "status-stopped";
    if (status === "completed") return "status-completed";
    return "";
  };

  // FETCH TODOS FROM DATABASE ON LOAD
  useEffect(() => {
    fetchTodos();
  }, []);

  // ESC KEY TO CLOSE EDIT MODAL
  useEffect(() => {
    if (!editingTodo) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setEditingTodo(null);
      }
    };

    document.addEventListener("keydown", handleEsc);
    // CLEANUP WHEN MODAL CLOSES
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [editingTodo]);

  // FUNC TO FORMAT DATE TO Y-M-D
  function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  }
  // FUNC TO FETCH TODOS FROM DATABASE
  async function fetchTodos() {
    const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: true });

    if (error) console.error(error);
    else setTodos(data ?? []);
  }
  // FUNC TO ADD NEW TODO
  async function addTodo() {
    const error = validateTitle(title);

    if (error) {
      setTitleError(error);
      return;
    }

    await supabase.from("todos").insert([
      {
        title: title.trim(),
        status: "incomplete",
        deadline: deadline || null,
      },
    ]);

    setTitle("");
    setTitleError("");
    setDeadline("");
    fetchTodos();
  }
  // FUNC TO UPDATE TODO STATUS
  async function setTodoStatus(id, status) {
    const { error } = await supabase.from("todos").update({ status }).eq("id", id);
    if (error) console.error(error);
    fetchTodos();
  }
  // FUNC TO DELETE TODO
  async function deleteTodo(id) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error(error);
    fetchTodos();
  }
  // HANDLER FOR SAVING EDITS
  const handleSave = async () => {
    const error = validateTitle(editTitle);

    if (error) {
      setEditTitleError(error);
      return;
    }

    await updateTodo(editingTodo.id, {
      title: editTitle,
      deadline: editDeadline,
    });

    setEditingTodo(null); // Close modal
  };
  // FUNC TO UPDATE TODO IN DATABASE
  async function updateTodo(id, updates) {
    if (!updates?.title?.trim()) return;

    const { error } = await supabase
      .from("todos")
      .update({
        title: updates.title.trim(),
        deadline: updates.deadline || null,
      })
      .eq("id", id);

    if (error) console.error(error);
    fetchTodos();
  }

  // MOBILE RESPO
  // FILTER TODOS BY STATUS
  const incompleteTodos = todos.filter((t) => t.status === "incomplete");
  const stoppedTodos = todos.filter((t) => t.status === "stopped");
  const completedTodos = todos.filter((t) => t.status === "completed");

  // STATE TO DETECT MOBILE VIEW
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 993);

  // WINDOW RESIZE LISTENER
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 993);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // STATE TO HOLD CURRENT MOBILE STATUS TAB
  const [mobileStatus, setMobileStatus] = useState("incomplete");

  // CONFIG OBJECT (DICT) FOR COLUMNS
  const STATUS_CONFIG = {
    incomplete: {
      title: "Planned",
      emptyText: "No tasks planned — add one to get started.",
      todos: incompleteTodos,
    },
    stopped: {
      title: "On Hold",
      emptyText: "No paused tasks.",
      todos: stoppedTodos,
    },
    completed: {
      title: "Completed",
      emptyText: "No completed tasks yet.",
      todos: completedTodos,
    },
  };

  // RENDER
  return (
    <>
      <Background />
      <div className="clouds">
        <div className="container">
          <div className="app-header">
            <h1 className="text-center mb-3">This is TODO LIST</h1>

            <div className="row align-items-end upper">
              {/* TITLE INPUT */}
              <div className="col-12 col-lg-5">
                <h5 className="">Task</h5>
                <input
                  className="form-control"
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e)}
                  placeholder="What needs doing?"
                />{" "}
                {titleError && <h6 className="text-danger validation-mb">{titleError}</h6>}
              </div>
              {/* DEADLINE INPUT */}
              <div className="col-12 col-lg-5">
                <h5 className="h5-deadline">Due date</h5>
                <input
                  type="date"
                  className="form-control"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              {/* BUTTON ADD*/}
              <div className="col-12 col-lg-2 d-grid">
                <button className="btn btn-primary" onClick={addTodo}>
                  New Task
                </button>
              </div>{" "}
              {/* INPUT ERROR MESSAGE */}
              {titleError && <h6 className="text-danger validation-ds">{titleError}</h6>}
            </div>
          </div>

          {/* TODOS SECTION */}
          <div className="row todos-row">
            {!isMobile ? (
              // DESKTOP: RENDER ALL COLUMNS
              Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <TodoColumn
                  key={status}
                  title={config.title}
                  todos={config.todos}
                  emptyText={config.emptyText}
                  onEdit={handleEditClick}
                  onDelete={deleteTodo}
                  onStatusChange={setTodoStatus}
                  formatDate={formatDate}
                  getStatusClass={getStatusClass}
                />
              ))
            ) : (
              // MOBILE: RENDER SINGLE COLUMN BASED ON STATUS
              <TodoColumn
                title={STATUS_CONFIG[mobileStatus].title}
                todos={STATUS_CONFIG[mobileStatus].todos}
                emptyText={STATUS_CONFIG[mobileStatus].emptyText}
                onEdit={handleEditClick}
                onDelete={deleteTodo}
                onStatusChange={setTodoStatus}
                formatDate={formatDate}
                getStatusClass={getStatusClass}
                mobileStatus={mobileStatus}
                setMobileStatus={setMobileStatus}
              />
            )}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingTodo && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                {/* MODAL HEADER */}
                <div className="modal-header">
                  <h5 className="modal-title">Edit Task</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingTodo(null)} />
                </div>
                {/* MODAL BODY */}
                <div className="modal-body">
                  <h5 className="">Task</h5>
                  <input className="form-control mb-2" value={editTitle} onChange={(e) => handleEditTitleChange(e)} />
                  {editTitleError && <h6 className="text-danger">{editTitleError}</h6>}

                  <h5 className="">Due Date</h5>
                  <input
                    type="date"
                    className="form-control"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>
                {/* MODAL FOOTER */}
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setEditingTodo(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* BACKDROP CLICK CLOSES MODAL */}
          <div className="modal-backdrop fade show" onClick={() => setEditingTodo(null)} />
        </>
      )}
    </>
  );
}

export default App;
