/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import { HTMLStencilElement, JSXBase } from '@stencil/core/internal';
import {
  SliderItem,
} from './components/nova-slider/models';

export namespace Components {
  interface MyComponent {
    /**
    * The first name
    */
    'first': string;
    /**
    * The last name
    */
    'last': string;
    /**
    * The middle name
    */
    'middle': string;
  }
  interface NovaSlider {
    'animateDelay': number | boolean;
    'animateIn': string;
    'animateNormal': string;
    'animateOut': string;
    'arrowKeys': boolean;
    'autoHeight': boolean;
    'autoWidth': boolean;
    'autoplay': boolean;
    'autoplayDirection': string;
    'autoplayHoverPause': boolean;
    'autoplayResetOnVisibility': boolean;
    'autoplayTimeout': number;
    'axis': string;
    'center': boolean;
    'disabled': boolean;
    'edgePadding': number;
    'fixedWidth': number | boolean;
    'freezable': boolean;
    'gutter': number;
    'items': SliderItem[];
    'lazyload': boolean;
    'loop': boolean;
    'mode': string;
    'mouseDrag': boolean;
    'nested': boolean | string;
    'onInit': Function | boolean;
    'perView': number;
    'preventActionWhenRunning': boolean;
    'preventScrollOnTouch': boolean | string;
    'responsive': object;
    'rewind': boolean;
    'slideBy': number | string;
    'speed': number;
    'startIndex': number;
    'swipeAngle': boolean | number;
    'touch': boolean;
    'useLocalStorage': boolean;
    'variant': string;
    'viewportMax': number | boolean;
  }
}

declare global {


  interface HTMLMyComponentElement extends Components.MyComponent, HTMLStencilElement {}
  var HTMLMyComponentElement: {
    prototype: HTMLMyComponentElement;
    new (): HTMLMyComponentElement;
  };

  interface HTMLNovaSliderElement extends Components.NovaSlider, HTMLStencilElement {}
  var HTMLNovaSliderElement: {
    prototype: HTMLNovaSliderElement;
    new (): HTMLNovaSliderElement;
  };
  interface HTMLElementTagNameMap {
    'my-component': HTMLMyComponentElement;
    'nova-slider': HTMLNovaSliderElement;
  }
}

declare namespace LocalJSX {
  interface MyComponent extends JSXBase.HTMLAttributes<HTMLMyComponentElement> {
    /**
    * The first name
    */
    'first'?: string;
    /**
    * The last name
    */
    'last'?: string;
    /**
    * The middle name
    */
    'middle'?: string;
  }
  interface NovaSlider extends JSXBase.HTMLAttributes<HTMLNovaSliderElement> {
    'animateDelay'?: number | boolean;
    'animateIn'?: string;
    'animateNormal'?: string;
    'animateOut'?: string;
    'arrowKeys'?: boolean;
    'autoHeight'?: boolean;
    'autoWidth'?: boolean;
    'autoplay'?: boolean;
    'autoplayDirection'?: string;
    'autoplayHoverPause'?: boolean;
    'autoplayResetOnVisibility'?: boolean;
    'autoplayTimeout'?: number;
    'axis'?: string;
    'center'?: boolean;
    'disabled'?: boolean;
    'edgePadding'?: number;
    'fixedWidth'?: number | boolean;
    'freezable'?: boolean;
    'gutter'?: number;
    'items'?: SliderItem[];
    'lazyload'?: boolean;
    'loop'?: boolean;
    'mode'?: string;
    'mouseDrag'?: boolean;
    'nested'?: boolean | string;
    'onInit'?: Function | boolean;
    'perView'?: number;
    'preventActionWhenRunning'?: boolean;
    'preventScrollOnTouch'?: boolean | string;
    'responsive'?: object;
    'rewind'?: boolean;
    'slideBy'?: number | string;
    'speed'?: number;
    'startIndex'?: number;
    'swipeAngle'?: boolean | number;
    'touch'?: boolean;
    'useLocalStorage'?: boolean;
    'variant'?: string;
    'viewportMax'?: number | boolean;
  }

  interface IntrinsicElements {
    'my-component': MyComponent;
    'nova-slider': NovaSlider;
  }
}

export { LocalJSX as JSX };


declare module "@stencil/core" {
  export namespace JSX {
    interface IntrinsicElements extends LocalJSX.IntrinsicElements {}
  }
}


