function TodoColumn({ title, todos, emptyText, onEdit, onDelete, onStatusChange, formatDate, getStatusClass }) {
  return (
    <div className="col-12 col-md-4">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{title}</h5>

          {todos.map((todo) => (
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
                          onClick={() => onEdit(todo)}
                        >
                          <i className="bi bi-pencil me-2"></i>
                          Edit
                        </button>
                      </li>

                      <li>
                        <button className="dropdown-item text-danger" onClick={() => onDelete(todo.id)}>
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
                          onClick={() => onStatusChange(todo.id, "incomplete")}
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
                          onClick={() => onStatusChange(todo.id, "stopped")}
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
                          onClick={() => onStatusChange(todo.id, "completed")}
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

          {todos.length === 0 && <div className="text-muted">{emptyText}</div>}
        </div>
      </div>
    </div>
  );
}

export default TodoColumn;
