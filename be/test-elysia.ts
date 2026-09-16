import { Elysia } from 'elysia';
const plugin = new Elysia({ prefix: '/plugin' }).get('/hello', () => 'hello');
const app = new Elysia();
app.use(plugin);
app.listen(5001);
console.log("started on 5001");
