import React, { useState, useEffect } from "react";
function TodoColumn({
  title,
  todos,
  emptyText,
  onEdit,
  onDelete,
  onStatusChange,
  formatDate,
  getStatusClass,
  mobileStatus,
  setMobileStatus,
}) {
  // STATUS OPTIONS FOR DROPDOWN
  const statusOptionsLocal = [
    { code: "incomplete", label: "Planned" },
    { code: "stopped", label: "On Hold" },
    { code: "completed", label: "Completed" },
  ];
  // FUNC TO FORMAT DATE
  const displayDateLocal = (dateString) => {
    if (!dateString) return "None";
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      return dateString;
    }
  };
  // FUNC TO CALC DAYS REMAINING OR OVERDUE
  const getDaysRemainingDisplay = (deadline) => {
    if (!deadline) return null;

    // HANDLE MULTIPLE DATE FORMATS
    const due =
      typeof deadline === "string" && deadline.includes(".")
        ? new Date(deadline.split(".").reverse().join("-"))
        : new Date(deadline);

    // SET TIME TO MIDNIGHT FOR CALC
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const days = Math.round((due - today) / 86400000);

    if (days < 0) {
      return {
        text: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} late`,
        isOverdue: true,
      };
    }

    return {
      text: days === 0 ? "Due today" : `${days} day${days === 1 ? "" : "s"} remaining`,
      isOverdue: false,
    };
  };
  // FUNC TO CALC COMPLETED DEADLINE STATUS
  const getCompletedDeadlineDisplay = (deadline, completedAt) => {
    if (!deadline || !completedAt) return null;

    // CALC DIFFERENCE BETWEEN DEADLINE AND COMPLETED DATE
    const days = Math.ceil((new Date(deadline) - new Date(completedAt)) / (1000 * 60 * 60 * 24));

    if (days > 0) {
      return {
        text: `${days} day${days === 1 ? "" : "s"} early`,
        isOverdue: false,
      };
    }

    if (days < 0) {
      return {
        text: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} late`,
        isOverdue: true,
      };
    }

    return {
      text: "On time",
      isOverdue: false,
    };
  };
  // STATE TO HOLD SORT TYPE
  const [sortType, setSortType] = React.useState("newest");
  // STATE TO CONTROL DROPDOWN VISIBILITY
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // SORT OPTIONS DEPENDING ON COLUMN TYPE
  const sortOptions = [
    { value: "newest", label: "Newest tasks" },
    { value: "oldest", label: "Oldest tasks" },
    ...(title === "Completed"
      ? [
          { value: "least-days-remaining", label: "Completed late" },
          { value: "most-days-remaining", label: "Completed early" },
        ]
      : [
          { value: "least-days-remaining", label: "Least days remaining" },
          { value: "most-days-remaining", label: "Most days remaining" },
        ]),
  ];
  // MAP SORT VALUES TO LABELS FOR DISPLAY
  const sortLabels = Object.fromEntries(sortOptions.map((opt) => [opt.value, opt.label]));

  // SORTING LOGIC
  const sortedTodos = React.useMemo(() => {
    // Copy of todos array to avoid changing original
    let arr = [...todos];

    if (sortType === "newest") {
      arr.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortType === "oldest") {
      arr.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortType === "least-days-remaining") {
      arr.sort((a, b) => {
        // If both have no deadline, keep their order
        if (!a.deadline && !b.deadline) return 0;
        // If a has no deadline, it goes after b
        if (!a.deadline) return 1;
        // If b has no deadline, it goes after a
        if (!b.deadline) return -1;
        // Calculate days remaining for a and b
        const aDays = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil((new Date(b.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        // Sort by closest to deadline
        return aDays - bDays;
      });
    } else if (sortType === "most-days-remaining") {
      arr.sort((a, b) => {
        // If both have no deadline, keep their order
        if (!a.deadline && !b.deadline) return 0;
        // If a has no deadline, it goes after b
        if (!a.deadline) return 1;
        // If b has no deadline, it goes after a
        if (!b.deadline) return -1;
        // Calculate days remaining for a and b
        const aDays = Math.ceil((new Date(a.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil((new Date(b.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        // Sort by farthest from deadline
        return bDays - aDays;
      });
    }
    return arr;
  }, [todos, sortType]);

  // FUNC TO CLOSE DROPDOWNS ON MOUSE LEAVE
  const closeDropdown = (id) => {
    try {
      const el = document.getElementById(`todo-${id}`);
      if (!el) return;

      // CLOSE ANY OPEN DROPDOWNS INSIDE THIS ELEMENT
      const dropdowns = el.querySelectorAll(".dropdown");
      dropdowns.forEach((dd) => {
        const menu = dd.querySelector(".dropdown-menu");
        const btn = dd.querySelector('[data-bs-toggle="dropdown"]');
        if (menu && menu.classList.contains("show")) menu.classList.remove("show");
        if (dd.classList.contains("show")) dd.classList.remove("show");
        if (btn) btn.setAttribute("aria-expanded", "false");
      });
    } catch (err) {}
  };

  // RENDER
  return (
    <div className="col-12 col-lg-4 todo-column d-flex flex-column">
      <div className="card flex-fill d-flex flex-column">
        {/* FIXED HEADER */}
        <div className="card-header text-center position-relative">
          {mobileStatus && setMobileStatus ? (
            <div className="dropdown">
              <h5 className="">{title}</h5>
              <button className="btn btn-sm btn-link p-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-chevron-down"></i>
              </button>

              <ul className="dropdown-menu dropdown-menu-end">
                {Object.entries({
                  incomplete: "Planned",
                  stopped: "On Hold",
                  completed: "Completed",
                }).map(([value, label]) => (
                  <li key={value}>
                    <button
                      className={`dropdown-item${mobileStatus === value ? " active" : ""}`}
                      onClick={() => setMobileStatus(value)}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <h5>{title}</h5>
          )}
        </div>

        {/* CUSTOM SORT DROPDOWN */}
        <div className="todo-filters mt-2 py-2 custom-dropdown-container">
          <div className="custom-dropdown" tabIndex={0} onBlur={() => setDropdownOpen(false)}>
            <button
              className="form-select form-select-sm custom-dropdown-toggle"
              onClick={() => setDropdownOpen((open) => !open)}
              title="Sort tasks"
              type="button"
              aria-expanded={dropdownOpen}
            >
              {sortLabels[sortType]}
              <i className="bi bi-chevron-down"></i>
            </button>
            {dropdownOpen && (
              <ul className="custom-dropdown-menu">
                {sortOptions.map((opt) => (
                  <li
                    key={opt.value}
                    className={`custom-dropdown-item${sortType === opt.value ? " active" : ""}`}
                    onClick={() => {
                      setSortType(opt.value);
                      setDropdownOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()} // Prevent losing focus on button
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="card-body p-2">
          {sortedTodos.map((todo) => (
            <div
              id={`todo-${todo.id}`}
              key={todo.id}
              className={`todo-item ${todo.status === "completed" ? "completed" : ""}`}
              onMouseLeave={() => closeDropdown(todo.id)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="fw-medium titles">{todo.title}</div>
                {/* ACTION BUTTONS */}
                <div className="d-flex align-items-center gap-2">
                  {/* EDIT / DELETE DROPDOWN */}
                  <div className="dropdown">
                    <button className="btn" type="button" data-bs-toggle="dropdown">
                      <i className="bi bi-pencil"></i>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <button className="dropdown-item" onClick={() => onEdit(todo)}>
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
                  {/* STATUS DROPDOWN */}
                  <div className="dropdown">
                    <button type="button" className="btn icon-btn" data-bs-toggle="dropdown" aria-expanded="false">
                      <span className={`status-dot ${getStatusClass(todo.status)}`} />
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end">
                      {statusOptionsLocal.map((opt) => (
                        <li key={opt.code}>
                          <button
                            className={`dropdown-item d-flex align-items-center gap-2 ${
                              todo.status === opt.code ? "active" : ""
                            }`}
                            onClick={() => onStatusChange(todo.id, opt.code)}
                          >
                            <span className={`status-dot ${getStatusClass(opt.code)}`} />
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              {/* DATE AND DEADLINE INFO */}
              <div className="d-flex justify-content-between text-muted small mt-1">
                <div>
                  <p className="text-center">Added: </p>
                  <p>{displayDateLocal(todo.created_at) || formatDate(todo.created_at)} </p>
                </div>

                {todo.deadline &&
                  (() => {
                    const isCompleted = todo.status === "completed";
                    const daysInfo = isCompleted
                      ? getCompletedDeadlineDisplay(todo.deadline, todo.completed_at ?? todo.created_at)
                      : getDaysRemainingDisplay(todo.deadline);

                    if (!daysInfo) return null;

                    return (
                      <div className={`days-display ${daysInfo.isOverdue ? "days-overdue" : "days-normal"}`}>
                        <i
                          className={`bi ${
                            isCompleted ? "bi-check-circle" : daysInfo.isOverdue ? "bi-exclamation-circle" : "bi-clock"
                          }`}
                        ></i>
                        <p className="days-text">{daysInfo.text}</p>
                      </div>
                    );
                  })()}
                <div>
                  <p className="text-center">Due:</p> <p>{todo.deadline ? displayDateLocal(todo.deadline) : "None"}</p>
                </div>
              </div>
            </div>
          ))}
          {/* EMPTY COLUMNS MESSAGE */}
          {sortedTodos.length === 0 && <div className="text-muted load-text">{emptyText}</div>}
        </div>
      </div>
    </div>
  );
}

export default TodoColumn;
