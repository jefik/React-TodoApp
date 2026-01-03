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
  const handleEditClick = (todo) => {
    setEditingTodo(todo);
    setEditTitle(todo.title ?? "");
    setEditDeadline(formatDate(todo.deadline));
  };

  const getStatusClass = (status) => {
    if (status === "incomplete") return "status-incomplete";
    if (status === "stopped") return "status-stopped";
    if (status === "completed") return "status-completed";
    return "";
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // ESCAPE LEAVE FUNC FOR MODAL
  useEffect(() => {
    if (!editingTodo) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setEditingTodo(null);
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [editingTodo]);

  function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  }

  async function fetchTodos() {
    const { data, error } = await supabase.from("todos").select("*").order("created_at", { ascending: true });

    if (error) console.error(error);
    else setTodos(data ?? []);
  }

  async function addTodo() {
    if (!title.trim()) return;

    const { error } = await supabase
      .from("todos")
      .insert([{ title: title.trim(), status: "incomplete", deadline: deadline || null }]); // default

    if (error) console.error(error);
    else {
      setTitle("");
      fetchTodos();
    }
  }

  async function setTodoStatus(id, status) {
    const { error } = await supabase.from("todos").update({ status }).eq("id", id);
    if (error) console.error(error);
    fetchTodos();
  }

  async function deleteTodo(id) {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) console.error(error);
    fetchTodos();
  }

  const handleSave = async () => {
    if (!editingTodo) return;

    await updateTodo(editingTodo.id, {
      title: editTitle,
      deadline: editDeadline,
    });

    setEditingTodo(null);
  };

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

  const incompleteTodos = todos.filter((t) => t.status === "incomplete");
  const stoppedTodos = todos.filter((t) => t.status === "stopped");
  const completedTodos = todos.filter((t) => t.status === "completed");

  return (
    // Restyle everything!!!!

    <>
      <Background />
      <div className="clouds">
        <div className="container">
          <div className="app-header">
            <h1 className="text-center mb-3">This is TODO LIST</h1>

            <div className="row align-items-end upper">
              {/* TITLE INPUT */}
              <div className="col-12 col-md-5">
                <label className="form-label">Title</label>
                <input
                  className="form-control"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Add a new TODO item"
                />
              </div>

              {/* DEADLINE INPUT */}
              <div className="col-12 col-md-5">
                <label className="form-label">Deadline</label>
                <input
                  type="date"
                  className="form-control"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              {/* BUTTON ADD*/}
              <div className="col-12 col-md-2 d-grid">
                <button className="btn btn-primary" onClick={addTodo}>
                  Add
                </button>
              </div>
            </div>
          </div>
          <div className="row todos-row">
            {/*  INCOMPLETE  */}
            <TodoColumn
              title="Incomplete"
              todos={incompleteTodos}
              emptyText="No incomplete tasks."
              onEdit={handleEditClick}
              onDelete={deleteTodo}
              onStatusChange={setTodoStatus}
              formatDate={formatDate}
              getStatusClass={getStatusClass}
            />
            {/*  PENDING  */}
            <TodoColumn
              title="Stopped"
              todos={stoppedTodos}
              emptyText="No stopped tasks."
              onEdit={handleEditClick}
              onDelete={deleteTodo}
              onStatusChange={setTodoStatus}
              formatDate={formatDate}
              getStatusClass={getStatusClass}
            />
            {/*  COMPLETED  */}
            <TodoColumn
              title="Completed"
              todos={completedTodos}
              emptyText="No completed tasks."
              onEdit={handleEditClick}
              onDelete={deleteTodo}
              onStatusChange={setTodoStatus}
              formatDate={formatDate}
              getStatusClass={getStatusClass}
            />
          </div>
        </div>
      </div>

      {/* RENDER EDIT MODAL */}
      {editingTodo && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Todo</h5>
                  <button type="button" className="btn-close" onClick={() => setEditingTodo(null)} />
                </div>

                <div className="modal-body">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control mb-2"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />

                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                  />
                </div>

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

          <div className="modal-backdrop fade show" onClick={() => setEditingTodo(null)} />
        </>
      )}
    </>
  );
}

export default App;
