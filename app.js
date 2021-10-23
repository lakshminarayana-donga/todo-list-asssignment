const express = require("express");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "todoApplication.db");

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The Server is Running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertTodoDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/?status=TO%20DO", async (request, response) => {
  const { status } = request.query;

  const selectTodosQuery = `SELECT * FROM todo WHERE status = '${status}';`;

  const todosArray = await database.all(selectTodosQuery);

  if (todosArray !== undefined) {
    response.send(
      todosArray.map((eachTodo) =>
        convertTodoDbObjectToResponseObject(eachTodo)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
});

app.get("/todos/?priority=HIGH", async (request, response) => {
  const { priority } = request.query;

  const selectTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;

  const todosArray = await database.all(selectTodosQuery);

  if (todosArray !== undefined) {
    response.send(
      todosArray.map((eachTodo) =>
        convertTodoDbObjectToResponseObject(eachTodo)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

// API 1 scenario3

app.get(
  "/todos/?priority=HIGH&status=IN%20PROGRESS",
  async (request, response) => {
    const { priority, status } = request.query;

    const selectTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}' AND status = '${status}';`;

    const todosArray = await database.all(selectTodosQuery);

    if (todosArray !== undefined) {
      response.send(
        todosArray.map((eachTodo) =>
          convertTodoDbObjectToResponseObject(eachTodo)
        )
      );
    } else {
      response.status(400);
      response.send("Invalid Todo Query");
    }
  }
);

// API 1 scenario 4

app.get("/todos/?search_q=Buy", async (request, response) => {
  const { search_q } = request.query;

  const selectTodosQuery = `SELECT * FROM todo WHERE todo LIKE "%'${search_q}'%";`;

  const todosArray = await database.all(selectTodosQuery);

  if (todosArray !== undefined) {
    response.send(
      todosArray.map((eachTodo) =>
        convertTodoDbObjectToResponseObject(eachTodo)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Todo search Query");
  }
});

// API 1 scenario 5

app.get("/todos/?category=WORK&status=DONE", async (request, response) => {
  const { category, status } = request.query;

  const selectTodosQuery = `SELECT * FROM todo WHERE category = '${category}' AND status = '${status}';`;

  const todosArray = await database.all(selectTodoQuery);

  if (todosArray !== undefined) {
    response.send(
      todosArray.map((eachTodo) =>
        convertTodoDbObjectToResponseObject(eachTodo)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Todo Category and Status");
  }
});

//API1 scenario 6

app.get("/todos/?category=HOME", async (request, response) => {
  const { category } = request.query;

  const selectTodosQuery = `SELECT * FROM todo WHERE category = '${category}';`;

  const todosArray = await database.all(selectTodosQuery);

  if (todosArray !== undefined) {
    response.send(
      todosArray.map((eachTodo) =>
        convertTodoDbObjectToResponseObject(eachTodo)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Todo category");
  }
});

//API 1 scenario 7

app.get(
  "/todos/?category=LEARNING&priority=HIGH",
  async (request, response) => {
    const { category, priority } = request.query;

    const selectTodosQuery = `SELECT * FROM todo WHERE category = '${category} AND priority ='${priority}';`;

    const todosArray = await database.all(selectTodosQuery);

    if (todosArray !== undefined) {
      response.send(
        todosArray.map((eachTodo) =>
          convertTodoDbObjectToResponseObject(eachTodo)
        )
      );
    } else {
      response.status(400);
      response.send("Invalid Todo Category and Priority");
    }
  }
);

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todosId } = request.params;

  const selectTodoQuery = `SELECT * FROM todo WHERE id = ${todosId};`;

  const todoObject = await database.get(selectTodoQuery);

  if (todoObject !== undefined) {
    response.send(convertTodoDbObjectToResponseObject(todoObject));
  } else {
    response.status(400);
    response.send("Invalid Todo Id");
  }
});

//API3
app.get("/agenda/?date=2021-02-22", async (request, response) => {
  const { date } = request.query;

  const [year, month, day] = date.split("-");

  const dateObject = format(new Date(year, month, day), "yyyy-MM-dd");

  const selectTodosQuery = `SELECT * FROM todo WHERE due_date = '${dateObject}';`;

  const todosArray = await database.all(selectTodosQuery);

  if (todosArray !== undefined) {
    response.send(
      todosArray.map((eachTodo) =>
        convertTodoDbObjectToResponseObject(eachTodo)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;

  const createTodoQuery = `
        INSERT INTO
            todo(id,todo,priority,status,category,due_date)
        VALUES
            (${id},'${todo}','${priority}','${status}','${category}','${dueDate}');`;
  await database.run(creatTodoQuery);
  response.send("Todo Successfully Added");
});

//API5 scenario1

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const { status } = request.body;

  const updateTodo = `UPDATE todo SET (status = '${status}' WHERE id = ${todoId};`;

  await database.run(updateTodo);
  response.send("Status Updated");
});

//API5 scenario2

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { priority } = request.body;

  const updateTodo = `UPDATE todo SET (priority = '${priority}' WHERE id = ${todoId};`;

  await database.run(updateTodo);
  response.send("Priority Updated");
});

//API 5 scenario 3

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo } = request.body;

  const updateTodoQuery = `UPDATE todo SET (todo = '${todo}' WHERE id = ${todoId};`;

  await database.run(updateTodoQuery);
  response.send("Todo Updated");
});

//API 5 scenario4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { category } = request.body;

  const updateCategoryQuery = `UPDATE todo SET (category = '${category}' WHERE id = ${todoId};`;

  await database.run(updateCategoryQuery);
  response.send("Category Updated");
});

//API 5 scenario 5;
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { dueDate } = request.body;

  const updateDueDateQuery = `UPDATE todo SET (due_date = '${dueDate}' WHERE id = ${todoId};`;

  await database.run(updateDueDateQuery);
  response.send("Due Date Updated");
});

//API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const deleteTodoQuery = `DELETE FROM todo WHERE id = ${todoId};`;

  await database.run(deleteTodoQuery);

  response.send("Todo Deleted");
});

module.exports = app;
