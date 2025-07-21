import Cookies from 'js-cookie';

export const setToken = (token?: string) => {
  if (!token) {
    Cookies.remove('accessToken');
  } else {
    Cookies.set('accessToken', token, { expires: 7 });
  }
};

export const getToken = () => {
  return Cookies.get('accessToken');
};

export const removeToken = () => {
  Cookies.remove('accessToken');
};
