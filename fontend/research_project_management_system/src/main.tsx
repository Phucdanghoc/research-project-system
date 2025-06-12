import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import   AppRouter from './routers/index.tsx';
import store from './store/index.ts';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
      <AppRouter />
      <ToastContainer />
  </Provider>,
);