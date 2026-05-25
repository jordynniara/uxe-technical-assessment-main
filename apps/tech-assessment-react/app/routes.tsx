import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('./app.tsx'),
  route('delivery-configuration/create', './routes/delivery-configuration-create.tsx'),
] satisfies RouteConfig;
