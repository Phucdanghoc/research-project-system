import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';

import './index.css';
import 'react-toastify/dist/ReactToastify.css';
// @ts-ignore
import AppRouter from './routers/index.jsx';
import store from './store';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <Provider store={store}>
    <AppRouter />
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
  </Provider>
);