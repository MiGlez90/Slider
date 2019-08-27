import { Component, Prop, h } from "@stencil/core";
import { NovaSliderMarkup } from "./NovaSliderMarkup";
import {
  ANIMATE_IN,
  ANIMATE_OUT,
  ANIMATE_NORMAL,
  AUTOPLAY_DIRECTION,
  AXIS,
  MODE,
  VARIANT
} from "./default-configuration";
import { SliderItem } from "./models";
import { SliderCardItem } from "./SliderCardItem";

@Component({
  tag: "nova-slider",
  styleUrl: "nova-slider.scss",
  shadow: true
})
export class NovaSlider {
  /**
   * prop text
   */
  @Prop() mode: string = MODE.CAROUSEL;
  @Prop() variant: string = VARIANT.CARDS;
  @Prop() axis: string = AXIS.HORIZONTAL;
  @Prop() items: SliderItem[] = [];
  @Prop() perView: number = 1;
  @Prop() gutter: number = 0;
  @Prop() edgePadding: number = 0;
  @Prop() fixedWidth: number | boolean = false;
  @Prop() autoWidth: boolean = false;
  @Prop() viewportMax: number | boolean = false;
  @Prop() slideBy: number | string = 1;
  @Prop() center: boolean = false;
  @Prop() arrowKeys: boolean = false;
  @Prop() speed: number = 300;
  @Prop() autoplay: boolean = false;
  @Prop() autoplayTimeout: number = 5000;
  @Prop() autoplayDirection: string = AUTOPLAY_DIRECTION.FORWARD;
  @Prop() autoplayHoverPause: boolean = false;
  @Prop() autoplayResetOnVisibility: boolean = true;
  @Prop() animateIn: string = ANIMATE_IN;
  @Prop() animateOut: string = ANIMATE_OUT;
  @Prop() animateNormal: string = ANIMATE_NORMAL;
  @Prop() animateDelay: number | boolean = false;
  @Prop() loop: boolean = true;
  @Prop() rewind: boolean = false;
  @Prop() autoHeight: boolean = false;
  @Prop() responsive: object;
  @Prop() lazyload: boolean = false;
  @Prop() touch: boolean = true;
  @Prop() mouseDrag: boolean = false;
  @Prop() swipeAngle: boolean | number = 15;
  @Prop() preventActionWhenRunning: boolean = false;
  @Prop() preventScrollOnTouch: boolean | string = false;
  @Prop() nested: boolean | string = false;
  @Prop() freezable: boolean = true;
  @Prop() disabled: boolean = false;
  @Prop() startIndex: number = 0;
  @Prop() onInit: Function | boolean = false;
  @Prop() useLocalStorage: boolean = true;

  getSliderItemComponent = variant => {
    switch (variant) {
      case VARIANT.CARDS.valueOf():
        return SliderCardItem;
    }
  };

  render() {
    const SliderItemComponent = this.getSliderItemComponent(this.variant);
    return (
      <NovaSliderMarkup
        mode={this.mode}
        variant={this.variant}
        axis={this.axis}
        gutter={this.gutter}
        items={this.items}
        SliderItemComponent={SliderItemComponent}
        perView={this.perView}
      />
    );
  }
}
