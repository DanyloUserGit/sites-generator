import Cookies from 'js-cookie';

export const setToken = (token: string) => {
  Cookies.set('accessToken', token, { expires: 7 });
};

export const getToken = () => {
  return Cookies.get('accessToken');
};

export const removeToken = () => {
  Cookies.remove('accessToken');
};
