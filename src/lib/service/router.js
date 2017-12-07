const reParam = /:[^/]+/g;

function matchRoute(route, pathname) {
  const reg = new RegExp('^' + route.replace(reParam, '[^/]+') + '$');
  return reg.test(pathname);
}

function extractParam(route, pathname) {
  const reg = new RegExp('^' + route.replace(reParam, '([^/]+)') + '$');
  const keys = route.match(reParam);
  if (!keys) {
    return {};
  }
  const value = pathname.match(reg);
  const length = keys.length;
  let ret = {};
  for (let idx=0; idx < length; idx ++) {
    ret[keys[idx].substr(1)] = value[1 + idx];
  }
  return ret;
}

class Route {
  constructor(route, routeFunction) {
    this.route = route;
    this.routeFunction = routeFunction;
    this.pathname = null;
  }
  match(pathname) {
    if (matchRoute(this.route, pathname)) {
      this.pathname = pathname;
      return true;
    }
    return false;
  }
  async checkPermission(options) {
    const params = extractParam(this.route, this.pathname);
    return await this.routeFunction(params, options);
  }
}

export default class Router {
  constructor() {
    this.routes = {
      GET: [],
      POST: [],
      DELETE: [],
      PUT: [],
    };
  }
  get(route, routeFunction) {
    this.routes.GET.push(new Route(route, routeFunction));
  }
  post(route, routeFunction) {
    this.routes.POST.push(new Route(route, routeFunction));
  }
  delete(route, routeFunction) {
    this.routes.DELETE.push(new Route(route, routeFunction));
  }
  put(route, routeFunction) {
    this.routes.PUT.push(new Route(route, routeFunction));
  }
  async checkPermission(method, pathname, options={}) {
    method = method.toUpperCase();
    for (let route of this.routes[method]) {
      if (route.match(pathname)) {
        return await route.checkPermission(options);
      }
    }
    return false;
  }
}
