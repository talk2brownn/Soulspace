// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// React Router v7 needs these in the Jest (jsdom) environment.
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// jsdom doesn't implement scrolling.
window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
