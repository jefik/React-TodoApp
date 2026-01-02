import React, { useState, useEffect } from "react";
import supabase from "./helper/supabaseClient";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editingTodo, setEditingTodo] = useState(null);
  const [editDeadline, setEditDeadline] = useState("");

  const StatusDot = ({ status, className = "", ...props }) => {
    return <span className={`status-dot status-${status} ${className}`} {...props} />;
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
    // PŘEDĚLAT VŠECHNY CLASSY
    <div className="container">
      <h1 className="text-center mb-3">This is TODO LIST</h1>

      <div className="row align-items-end upper">
        {/* Title input */}
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

        {/* Deadline input */}
        <div className="col-12 col-md-5">
          <label className="form-label">Deadline</label>
          <input type="date" className="form-control" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        {/* Button */}
        <div className="col-12 col-md-2 d-grid">
          <button className="btn btn-primary">Add</button>
        </div>
      </div>

      <div className="row">
        {/*  INCOMPLETE  */}
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Incomplete</h5>
              {editingTodo && (
                <div className="modal fade" id="editTodoModal">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Task</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                      </div>

                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Task Name</label>
                          <input
                            className="form-control"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Deadline</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button className="btn btn-secondary" data-bs-dismiss="modal">
                          Cancel
                        </button>

                        <button className="btn btn-primary" onClick={handleSave} data-bs-dismiss="modal">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {incompleteTodos.map((todo) => (
                <div key={todo.id} className="border-bottom py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-medium titles">{todo.title}</div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="dropdown">
                        <button
                          className="btn btn-light btn-sm border"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          aria-label="Edit todo"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              data-bs-toggle="modal"
                              data-bs-target="#editTodoModal"
                              onClick={() => {
                                setEditingTodo(todo);
                                setEditTitle(todo.title ?? "");
                                setEditDeadline(formatDate(todo.deadline));
                              }}
                            >
                              <i className="bi bi-pencil me-2"></i>
                              Edit
                            </button>
                          </li>

                          <li>
                            <button className="dropdown-item text-danger" onClick={() => deleteTodo(todo.id)}>
                              <i className="bi bi-trash me-2"></i>
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>

                      <div className="dropdown">
                        <span
                          className={`status-dot ${getStatusClass(todo.status)}`}
                          data-bs-toggle="dropdown"
                          role="button"
                        />

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "incomplete" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "incomplete")}
                            >
                              <span className={`status-dot ${getStatusClass("incomplete")}`} />
                              Incomplete
                            </button>
                          </li>

                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "stopped" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "stopped")}
                            >
                              <span className={`status-dot ${getStatusClass("stopped")}`} />
                              Stopp
                            </button>
                          </li>

                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "completed" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "completed")}
                            >
                              <span className={`status-dot ${getStatusClass("completed")}`} />
                              Complete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between text-muted small mt-1">
                    <div>Created: {formatDate(todo.created_at)}</div>
                    {todo.deadline && (
                      <div>Days left: {Math.ceil((new Date(todo.deadline) - new Date()) / (1000 * 60 * 60 * 24))}</div>
                    )}

                    <div>Deadline: {todo.deadline ? formatDate(todo.deadline) : "None"}</div>
                  </div>
                </div>
              ))}

              {incompleteTodos.length === 0 && <div className="text-muted">No incomplete tasks.</div>}
            </div>
          </div>
        </div>
        {/*  PENDING  */}
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Stopped</h5>

              {editingTodo && (
                <div className="modal fade" id="editTodoModal">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Task</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                      </div>

                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Task Name</label>
                          <input
                            className="form-control"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Deadline</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button className="btn btn-secondary" data-bs-dismiss="modal">
                          Cancel
                        </button>

                        <button className="btn btn-primary" onClick={handleSave} data-bs-dismiss="modal">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {stoppedTodos.map((todo) => (
                <div key={todo.id} className="border-bottom py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-medium">{todo.title}</div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="dropdown">
                        <button
                          className="btn btn-light btn-sm border"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          aria-label="Edit todo"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              data-bs-toggle="modal"
                              data-bs-target="#editTodoModal"
                              onClick={() => {
                                setEditingTodo(todo);
                                setEditTitle(todo.title ?? "");
                                setEditDeadline(todo.deadline ?? "");
                              }}
                            >
                              <i className="bi bi-pencil me-2"></i>
                              Edit
                            </button>
                          </li>

                          <li>
                            <button className="dropdown-item text-danger" onClick={() => deleteTodo(todo.id)}>
                              <i className="bi bi-trash me-2"></i>
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>

                      <div className="dropdown">
                        <span
                          className={`status-dot ${getStatusClass(todo.status)}`}
                          data-bs-toggle="dropdown"
                          role="button"
                        />

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "incomplete" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "incomplete")}
                            >
                              <span className={`status-dot ${getStatusClass("incomplete")}`} />
                              Incomplete
                            </button>
                          </li>

                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "stopped" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "stopped")}
                            >
                              <span className={`status-dot ${getStatusClass("stopped")}`} />
                              Stopp
                            </button>
                          </li>

                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "completed" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "completed")}
                            >
                              <span className={`status-dot ${getStatusClass("completed")}`} />
                              Complete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between text-muted small mt-1">
                    <div>Created: {formatDate(todo.created_at)}</div>
                    {todo.deadline && (
                      <div>Days left: {Math.ceil((new Date(todo.deadline) - new Date()) / (1000 * 60 * 60 * 24))}</div>
                    )}

                    <div>Deadline: {todo.deadline ? formatDate(todo.deadline) : "None"}</div>
                  </div>
                </div>
              ))}

              {stoppedTodos.length === 0 && <div className="text-muted">No stopped tasks.</div>}
            </div>
          </div>
        </div>
        {/*  COMPLETED  */}
        <div className="col-12 col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Completed</h5>

              {editingTodo && (
                <div className="modal fade" id="editTodoModal">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Task</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" />
                      </div>

                      <div className="modal-body">
                        <div className="mb-3">
                          <label className="form-label">Task Name</label>
                          <input
                            className="form-control"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">Deadline</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editDeadline}
                            onChange={(e) => setEditDeadline(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button className="btn btn-secondary" data-bs-dismiss="modal">
                          Cancel
                        </button>

                        <button className="btn btn-primary" onClick={handleSave} data-bs-dismiss="modal">
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {completedTodos.map((todo) => (
                <div key={todo.id} className="border-bottom py-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-medium">{todo.title}</div>

                    <div className="d-flex align-items-center gap-2">
                      <div className="dropdown">
                        <button
                          className="btn btn-light btn-sm border"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          aria-label="Edit todo"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className="dropdown-item"
                              data-bs-toggle="modal"
                              data-bs-target="#editTodoModal"
                              onClick={() => {
                                setEditingTodo(todo);
                                setEditTitle(todo.title ?? "");
                                setEditDeadline(todo.deadline ?? "");
                              }}
                            >
                              <i className="bi bi-pencil me-2"></i>
                              Edit
                            </button>
                          </li>

                          <li>
                            <button className="dropdown-item text-danger" onClick={() => deleteTodo(todo.id)}>
                              <i className="bi bi-trash me-2"></i>
                              Delete
                            </button>
                          </li>
                        </ul>
                      </div>

                      <div className="dropdown">
                        <span
                          className={`status-dot ${getStatusClass(todo.status)}`}
                          data-bs-toggle="dropdown"
                          role="button"
                        />

                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "incomplete" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "incomplete")}
                            >
                              <span className={`status-dot ${getStatusClass("incomplete")}`} />
                              Incomplete
                            </button>
                          </li>

                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "stopped" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "stopped")}
                            >
                              <span className={`status-dot ${getStatusClass("stopped")}`} />
                              Stopp
                            </button>
                          </li>

                          <li>
                            <button
                              className={`dropdown-item d-flex align-items-center gap-2 ${
                                todo.status === "completed" ? "active" : ""
                              }`}
                              onClick={() => setTodoStatus(todo.id, "completed")}
                            >
                              <span className={`status-dot ${getStatusClass("completed")}`} />
                              Complete
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between text-muted small mt-1">
                    <div>Created: {formatDate(todo.created_at)}</div>
                    {todo.deadline && (
                      <div>Days left: {Math.ceil((new Date(todo.deadline) - new Date()) / (1000 * 60 * 60 * 24))}</div>
                    )}

                    <div>Deadline: {todo.deadline ? formatDate(todo.deadline) : "None"}</div>
                  </div>
                </div>
              ))}

              {completedTodos.length === 0 && <div className="text-muted">No completed tasks.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
