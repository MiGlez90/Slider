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
import {has3DTransforms} from "./helpers/has3DTransforms";

@Component({
  tag: "nova-slider",
  styleUrl: "nova-slider.scss",
  shadow: true
})
export class NovaSlider {
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
  private slidePositions: any[] = [];
  private transformAttr: string;
  private transformPrefix: string;
  private transformPostfix: string;
  private transitionDuration;
  private isCarousel: boolean;
  private isHorizontal: boolean;
  private slideCount: number;
  private cloneCount: number;
  private slideCountNew: number;
  private index: number;

  getItemsMax = () => {
    if (this.autoWidth || (this.fixedWidth && !this.viewportMax)) {
      return this.slideCount - 1;
      // most cases
    } else {
      let str = this.fixedWidth ? "fixedWidth" : "perView",
        arr = [];

      if (this.fixedWidth || this[str] < this.slideCount) {
        arr.push(this[str]);
      }

      if (this.responsive) {
        for (let bp in this.responsive) {
          let tem = this.responsive[bp][str];
          if (tem && (this.fixedWidth || tem < this.slideCount)) {
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
    let itemsMax = this.getItemsMax(),
      result = this.isCarousel
        ? Math.ceil((itemsMax * 5 - this.slideCount) / 2)
        : itemsMax * 4 - this.slideCount;
    result = Math.max(itemsMax, result);

    return this["edgePadding"] ? result + 1 : result;
  };

  getSliderItemComponent = variant => {
    switch (variant) {
      case VARIANT.CARDS.valueOf():
        return SliderCardItem;
    }
  };

  getStartIndex = ind => {
    ind = ind
      ? Math.max(
          0,
          Math.min(this.loop ? this.slideCount - 1 : this.slideCount - this.perView, ind)
        )
      : 0;
    return this.mode === MODE.CAROUSEL.valueOf() ? ind + this.cloneCount : ind;
  };

  getWindowWidth = () => {
    return (
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth
    );
  };

  getClientWidth = el => {
    let div = document.createElement("div"),
      rect,
      width;
    el.appendChild(div);
    rect = div.getBoundingClientRect();
    width = rect.right - rect.left;
    div.remove();
    return width || this.getClientWidth(el.parentNode);
  };

  getViewportWidth = () => {
    const root = this.el.shadowRoot || this.el;
    const container = root.querySelector("tns-inner");
    let gap = this.edgePadding ? this.edgePadding * 2 - this.gutter : 0;
    return this.getClientWidth(container) - gap;
  };

  getOption = (item, ww?) => {
    if (ww == null) {
      ww = this.getWindowWidth();
    }

    if (item === "items" && this.fixedWidth) {
      return (
        Math.floor(
          (this.getViewportWidth() + this.gutter) /
            ((this.fixedWidth as number) + this.gutter)
        ) || 1
      );
    } else {
      let result = this[item];

      if (this.responsive) {
        for (let bp in this.responsive) {
          // bp: convert string to number
          if (ww >= parseInt(bp)) {
            if (item in this.responsive[bp]) {
              result = this.responsive[bp][item];
            }
          }
        }
      }

      if (item === "slideBy" && result === "page") {
        result = this.getOption("items");
      }
      if (
        this.mode !== MODE.CAROUSEL.valueOf() &&
        (item === "slideBy" || item === "items")
      ) {
        result = Math.floor(result);
      }

      return result;
    }
  };

  getIndex = () => {
    return this.getStartIndex(this.getOption("startIndex"));
  };

  getCenterGap = (num?) => {
    if (num == null) {
      num = this.getIndex();
    }

    let gap = this.edgePadding ? this.gutter : 0;
    return this.autoWidth
      ? (this.getViewportWidth() -
          gap -
          (this.slidePositions[num + 1] -
            this.slidePositions[num] -
            this.gutter)) /
          2
      : this.fixedWidth
      ? (this.getViewportWidth() - (this.fixedWidth as number)) / 2
      : (this.perView - 1) / 2;
  };

  getSliderWidth = () => {
    return this.fixedWidth
      ? ((this.fixedWidth as number) + this.gutter) * this.slideCountNew
      : this.slidePositions[this.slideCountNew];
  };

  getRightBoundary = () => {
    let gap = this.edgePadding ? this.gutter : 0,
      result = this.getViewportWidth() + gap - this.getSliderWidth();

    if (this.center && !this.loop) {
      result = this.fixedWidth
        ? -((this.fixedWidth as number) + this.gutter) * (this.slideCountNew - 1) -
          this.getCenterGap()
        : this.getCenterGap(this.slideCountNew - 1) -
          this.slidePositions[this.slideCountNew - 1];
    }
    if (result > 0) {
      result = 0;
    }

    return result;
  };

  getContainerTransformValue = (num?) => {
    const hasRightDeadZone = (this.fixedWidth || this.autoWidth) && !this.loop;
    const rightBoundary = this.fixedWidth ? this.getRightBoundary() : null;
    if (num == null) {
      num = this.index;
    }

    let val;
    if (this.isHorizontal && !this.autoWidth) {
      if (this.fixedWidth) {
        val = -((this.fixedWidth as number) + this.gutter) * num;
        if (this.center) {
          val += this.getCenterGap();
        }
      } else {
        let denominator = "transform" ? this.slideCountNew : this.perView;
        if (this.center) {
          num -= this.getCenterGap();
        }
        val = (-num * 100) / denominator;
      }
    } else {
      val = -this.slidePositions[num];
      if (this.center && this.autoWidth) {
        val += this.getCenterGap();
      }
    }

    if (hasRightDeadZone) {
      val = Math.max(val, rightBoundary);
    }

    val += this.isHorizontal && !this.autoWidth && !this.fixedWidth ? "%" : "px";

    return val;
  };

  getContainerStyle = () => {
    const transform = this.transformPrefix + this.getContainerTransformValue() + this.transformPostfix;
    return {
      transitionDuration: this.transitionDuration,
      [this.transformAttr] : transform
    }
  };

  updateTransformVariables = () => {
    this.transformAttr = this.mode === AXIS.HORIZONTAL.valueOf() ? "left": "top";
    this.transformAttr = "transform";
    this.transformPrefix = 'translate';

    const HAS3DTRANSFORMS = has3DTransforms("transform");

    if (HAS3DTRANSFORMS) {
      this.transformPrefix += this.isHorizontal ? '3d(' : '3d(0px, ';
      this.transformPostfix = this.isHorizontal ? ', 0px, 0px)' : ', 0px)';
    } else {
      this.transformPrefix += this.isHorizontal ? 'X(' : 'Y(';
      this.transformPostfix = ')';
    }
  };

  updateLocalVariables = () => {
    this.isCarousel = this.mode === MODE.CAROUSEL.valueOf();
    this.isHorizontal = this.axis === AXIS.HORIZONTAL.valueOf();
    this.slideCount = this.items.length;
    this.transitionDuration = this.isCarousel ? "0s" : undefined;
    this.cloneCount = this.loop ? this.getCloneCountForLoop() : 0;
    this.slideCountNew =
      this.mode !== MODE.CAROUSEL.valueOf()
        ? this.slideCount + this.cloneCount
        : this.slideCount + this.cloneCount * 2;
    this.index = this.getIndex();
    this.updateTransformVariables();
  };

  componentWillRender(){
    this.updateLocalVariables();
  }

  render() {
    const SliderItemComponent = this.getSliderItemComponent(this.variant);
    const slideId = getSlideId();
    const isPercentageLayoutSupported = percentageLayout();
    const calcPrefixCSS: string | boolean = calc();
    const containerStyle = this.getContainerStyle();
    return (
      <NovaSliderMarkup
        autoWidth={this.autoWidth}
        autoHeight={this.autoHeight}
        animateNormal={this.animateNormal}
        axis={this.axis}
        cloneCount={this.cloneCount}
        mode={this.mode}
        variant={this.variant}
        gutter={this.gutter}
        items={this.items}
        SliderItemComponent={SliderItemComponent}
        perView={this.perView}
        slideId={slideId}
        isPercentageLayoutSupported={isPercentageLayoutSupported}
        calcPrefixCSS={calcPrefixCSS}
        containerStyle={containerStyle}
      />
    );
  }
}
