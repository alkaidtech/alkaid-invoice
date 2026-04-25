import { mount } from 'svelte';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/700.css';
import App from './App.svelte';
import './app.css';

const appConfig = typeof __APP_CONFIG__ !== 'undefined' && __APP_CONFIG__ ? __APP_CONFIG__ : {};
const defaultBusiness = {
  name: '',
  abn: '',
  email: '',
  phone: '',
  address: [],
  bankDetails: {
    accountName: '',
    bsb: '',
    accountNumber: '',
    payid: ''
  }
};

mount(App, {
  target: document.getElementById('app'),
  props: {
    business: {
      ...defaultBusiness,
      ...(appConfig.business ?? {}),
      bankDetails: {
        ...defaultBusiness.bankDetails,
        ...(appConfig.business?.bankDetails ?? {})
      },
      address: Array.isArray(appConfig.business?.address) ? appConfig.business.address : []
    }
  }
});
