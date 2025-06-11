export class Api {
  static BASE_URL = 'http://192.168.1.3:3000/';
  static GET_MENU = `${this.BASE_URL}restaurants/Big Bistro/menu`;
  static ADD_MENU = `${this.BASE_URL}restaurants/add`;
  static LOG_IN = `${this.BASE_URL}auth/login`;
  static POST_FCM_TOKEN = `${this.BASE_URL}auth/register-token`;

  static GET_TODAY_ORDER = `${this.BASE_URL}order/todayOrder`;
}

export class Request_Type {
  static get = 'GET';
  static post = 'POST';
}
