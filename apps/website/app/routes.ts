import {index, route, type RouteConfig} from '@react-router/dev/routes';

const pg = (page: string) => `pages/${page}.tsx`;

export default [index(pg('home')), route('*', pg('not-found'))] satisfies RouteConfig;
