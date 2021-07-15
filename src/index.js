const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const userAccountExists  = users.find((user) => user.username === username);

  if(!userAccountExists){
    return response.status(404).json({error:'User Account does not exists.'});
  }

  request.user = userAccountExists;

  next();

}

app.post('/users', (request, response) => {
  const {name,username} = request.body;

  const userAccountHasExists = users.some((user) => user.username === username);

  if(userAccountHasExists){
    return response.status(400).json({error:"Username has exists, please try another."});
  }

  const user = {
    id: uuidv4(),
	  name, 
	  username, 
	  todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {

  const {user} = request;

  return response.json(user.todos);

  console.log(users);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;

  const todo = {
    id: uuidv4(),
	  title,
	  done:false, 
	  deadline:new Date(deadline), 
	  created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {user} = request;
  const {id} = request.params;
  
  const todo = user.todos.find((todo) => todo.id === id);
  
  if(!todo){
    return response.status(404).json({error:"Todo does not exists."});
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const alterUserTodo = user.todos.find((todo) => todo.id === id);

  if(!alterUserTodo){
    return response.status(404).json({error:"Todo does not exists."});
  }

  alterUserTodo.done = true;

  return response.json(alterUserTodo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const deleteTodoWithId = user.todos.findIndex((todo) => todo.id === id);

  if(deleteTodoWithId === -1){
    return response.status(404).json({error:"Todo does not exists."});
  }

  user.todos.splice(deleteTodoWithId,1);

  return response.status(204).json(users);

});

module.exports = app;