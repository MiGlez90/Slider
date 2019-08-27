import { Component, Prop, Element, h } from "@stencil/core";
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
import { getSlideId } from "./helpers/getSlideId";
import { percentageLayout } from "./helpers/percentageLayout";
import { calc } from "./helpers/calc";

@Component({
  tag: "nova-slider",
  styleUrl: "nova-slider.scss",
  shadow: true
})
export class NovaSlider {
  /**
   * prop text
   */
  @Element() el;
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

  getItemsMax = () => {
    const slideCount = this.items.length;
    if (this.autoWidth || (this.fixedWidth && !this.viewportMax)) {
      return slideCount - 1;
      // most cases
    } else {
      let str = this.fixedWidth ? "fixedWidth" : "perView",
        arr = [];

      if (this.fixedWidth || this[str] < slideCount) {
        arr.push(this[str]);
      }

      if (this.responsive) {
        for (let bp in this.responsive) {
          let tem = this.responsive[bp][str];
          if (tem && (this.fixedWidth || tem < slideCount)) {
            arr.push(tem);
          }
        }
      }

      if (!arr.length) {
        arr.push(0);
      }

      return Math.ceil(
        this.fixedWidth
          ? (this.viewportMax as number) / Math.min.apply(null, arr)
          : Math.max.apply(null, arr)
      );
    }
  };

  getCloneCountForLoop = () => {
    const slideCount = this.items.length;
    const isCarousel = this.mode === MODE.CAROUSEL.valueOf();
    let itemsMax = this.getItemsMax(),
      result = isCarousel
        ? Math.ceil((itemsMax * 5 - slideCount) / 2)
        : itemsMax * 4 - slideCount;
    result = Math.max(itemsMax, result);

    return this["edgePadding"] ? result + 1 : result;
  };

  getSliderItemComponent = variant => {
    switch (variant) {
      case VARIANT.CARDS.valueOf():
        return SliderCardItem;
    }
  };

  render() {
    const SliderItemComponent = this.getSliderItemComponent(this.variant);
    const slideId = getSlideId();
    const isPercentageLayoutSupported = percentageLayout();
    const calcPrefixCSS: string | boolean = calc();
    const cloneCount: number = this.loop ? this.getCloneCountForLoop() : 0;
    return (
      <NovaSliderMarkup
        autoWidth={this.autoWidth}
        autoHeight={this.autoHeight}
        animateNormal={this.animateNormal}
        axis={this.axis}
        cloneCount={cloneCount}
        mode={this.mode}
        variant={this.variant}
        gutter={this.gutter}
        items={this.items}
        SliderItemComponent={SliderItemComponent}
        perView={this.perView}
        slideId={slideId}
        isPercentageLayoutSupported={isPercentageLayoutSupported}
        calcPrefixCSS={calcPrefixCSS}
      />
    );
  }
}
