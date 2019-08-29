import { Component, Prop, Element, h, State } from "@stencil/core";
import { NovaSliderMarkup } from "./NovaSliderMarkup";
import {
  ANIMATE_IN,
  ANIMATE_OUT,
  ANIMATE_NORMAL,
  AUTOPLAY_DIRECTION,
  AXIS,
  MODE,
  VARIANT,
  SLIDE_BY
} from "./default-configuration";
import { SliderItem } from "./models";
import { SliderCardItem } from "./SliderCardItem";
import { addEvents } from "./helpers/addEvents";
import { addClass } from "./helpers/addClass";
import { getSlideId } from "./helpers/getSlideId";
import { percentageLayout } from "./helpers/percentageLayout";
import { calc } from "./helpers/calc";
import { has3DTransforms } from "./helpers/has3DTransforms";
import { removeClass } from "./helpers/removeClass";
import { removeEvents } from "./helpers/removeEvents";
import { raf } from "./helpers/raf";
import { hasClass } from "./helpers/hasClass";

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
  @State() index: number;
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
  private imgEvents: any;
  private imgsComplete: boolean;
  private imgCompleteClass: string = "tns-complete";
  private rightBoundary;
  private freeze;
  private viewport;
  private indexMax: number;
  private indexMin: number = 0;
  private isRunning: boolean;
  private controlsContainer: HTMLElement;
  private prevButton: HTMLElement;
  private nextButton: HTMLElement;

  getTarget = e => {
    return e.target || window.event.srcElement;
  };

  onImgLoaded = e => {
    this.imgLoaded(this.getTarget(e));
  };

  onImgFailed = e => {
    this.imgFailed(this.getTarget(e));
  };

  imgLoaded = img => {
    addClass(img, "loaded");
    this.imgCompleted(img);
  };

  imgFailed = img => {
    addClass(img, "failed");
    this.imgCompleted(img);
  };

  imgCompleted = img => {
    addClass(img, "tns-complete");
    removeClass(img, "loading");
    removeEvents(img, this.imgEvents);
  };

  isTouchEvent = e => {
    return e.type.indexOf("touch") >= 0;
  };

  getEvent = e => {
    e = e || window.event;
    return this.isTouchEvent(e) ? e.changedTouches[0] : e;
  };

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
          Math.min(
            this.loop ? this.slideCount - 1 : this.slideCount - this.perView,
            ind
          )
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
    if (!el) return;
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
    const container = root.querySelector(".tns-inner");
    let gap = this.edgePadding ? this.edgePadding * 2 - this.gutter : 0;
    return this.getClientWidth(container) - gap;
  };

  getOption = (item, ww?) => {
    if (ww == null) {
      ww = this.getWindowWidth();
    }

    if (item === "perView" && this.fixedWidth) {
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
        result = this.getOption("perView");
      }
      if (
        this.mode !== MODE.CAROUSEL.valueOf() &&
        (item === "slideBy" || item === "perView")
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
        ? -((this.fixedWidth as number) + this.gutter) *
            (this.slideCountNew - 1) -
          this.getCenterGap()
        : this.getCenterGap(this.slideCountNew - 1) -
          this.slidePositions[this.slideCountNew - 1];
    }
    if (result > 0) {
      result = 0;
    }

    return result;
  };

  getAbsIndex = (i?) => {
    if (i == null) {
      i = this.index;
    }

    if (this.isCarousel) {
      i -= this.cloneCount;
    }
    while (i < 0) {
      i += this.slideCount;
    }

    return Math.floor(i % this.slideCount);
  };

  goTo(targetIndex, e) {
    if (this.freeze) {
      return;
    }
    debugger;

    // prev slideBy
    if (targetIndex === "prev") {
      this.onControlsClick(e, -1);

      // next slideBy
    } else if (targetIndex === "next") {
      this.onControlsClick(e, 1);

      // go to exact slide
    } else {
      if (this.isRunning) {
        //if (this.preventActionWhenRunning) { return; } else { this.onTransitionEnd(); }
      }

      var absIndex = this.getAbsIndex(),
        indexGap = 0;

      if (targetIndex === "first") {
        indexGap = -absIndex;
      } else if (targetIndex === "last") {
        indexGap = this.isCarousel
          ? this.slideCount - this.perView - absIndex
          : this.slideCount - 1 - absIndex;
      } else {
        if (typeof targetIndex !== "number") {
          targetIndex = parseInt(targetIndex);
        }

        if (!isNaN(targetIndex)) {
          // from directly called goTo function
          if (!e) {
            targetIndex = Math.max(
              0,
              Math.min(this.slideCount - 1, targetIndex)
            );
          }

          indexGap = targetIndex - absIndex;
        }
      }

      // gallery: make sure new page won't overlap with current page
      if (!this.isCarousel && indexGap && Math.abs(indexGap) < this.perView) {
        var factor = indexGap > 0 ? 1 : -1;
        indexGap +=
          this.index + indexGap - this.slideCount >= this.indexMin
            ? this.slideCount * factor
            : this.slideCount * 2 * factor * -1;
      }

      this.index += indexGap;

      // make sure index is in range
      if (this.isCarousel && this.loop) {
        if (this.index < this.indexMin) {
          this.index += this.slideCount;
        }
        if (this.index > this.indexMax) {
          this.index -= this.slideCount;
        }
      }
    }
  }

  onControlsClick = (e, dir) => {
    if (this.isRunning) {
      if (this.preventActionWhenRunning) {
        return;
      } else {
        //onTransitionEnd();
      }
    }

    if (!dir) {
      e = this.getEvent(e);
      let target = this.getTarget(e);

      while (
        target !== this.controlsContainer &&
        [this.prevButton, this.nextButton].indexOf(target) < 0
      ) {
        target = target.parentNode;
      }

      let targetIn = [this.prevButton, this.nextButton].indexOf(target);
      if (targetIn >= 0) {
        dir = targetIn === 0 ? -1 : 1;
      }
    }

    if (this.rewind) {
      if (this.index === this.indexMin && dir === -1) {
        this.goTo("last", e);
        return;
      } else if (this.index === this.indexMax && dir === 1) {
        this.goTo("first", e);
        return;
      }
    }

    if (dir) {
      this.index += (this.slideBy as number) * dir;
      if (this.autoWidth) {
        this.index = Math.floor(this.index);
      }
    }
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

    val +=
      this.isHorizontal && !this.autoWidth && !this.fixedWidth ? "%" : "px";

    return val;
  };

  getContainerWidth = () => {
    if (this.fixedWidth) {
      return (
        ((this.fixedWidth as number) + this.gutter) * this.slideCountNew + "px"
      );
    } else {
      return "calc(" + this.slideCountNew * 100 + "% / " + this.perView + ")";
    }
  };

  getContainerStyle = () => {
    const transform =
      this.transformPrefix +
      this.getContainerTransformValue() +
      this.transformPostfix;
    const width = this.getContainerWidth();
    return {
      transitionDuration: this.transitionDuration,
      [this.transformAttr]: transform,
      width
    };
  };

  updateTransformVariables = () => {
    this.transformAttr =
      this.mode === AXIS.HORIZONTAL.valueOf() ? "left" : "top";
    this.transformAttr = "transform";
    this.transformPrefix = "translate";

    const HAS3DTRANSFORMS = has3DTransforms("transform");

    if (HAS3DTRANSFORMS) {
      this.transformPrefix += this.isHorizontal ? "3d(" : "3d(0px, ";
      this.transformPostfix = this.isHorizontal ? ", 0px, 0px)" : ", 0px)";
    } else {
      this.transformPrefix += this.isHorizontal ? "X(" : "Y(";
      this.transformPostfix = ")";
    }
  };

  hasOption = item => {
    if (this[item]) {
      return true;
    } else {
      if (this.responsive) {
        for (var bp in this.responsive) {
          if (this.responsive[bp][item]) {
            return true;
          }
        }
      }
      return false;
    }
  };

  imgsLoadedCheck = (imgs, cb) => {
    // directly execute callback function if all images are complete
    if (this.imgsComplete) {
      return cb();
    }

    // check selected image classes otherwise
    imgs.forEach((img, index) => {
      if (hasClass(img, this.imgCompleteClass)) {
        imgs.splice(index, 1);
      }
    });

    // execute callback function if selected images are all complete
    if (!imgs.length) {
      return cb();
    }

    // otherwise execute this function again
    raf(() => {
      this.imgsLoadedCheck(imgs, cb);
    });
  };

  getImageArray = (start, end) => {
    let imgs = [];
    const root = this.el.shadowRoot || this.el;
    const slideItems = root.querySelectorAll(".tns-item");
    while (start <= end) {
      slideItems[start].querySelectorAll("img").forEach(img => imgs.push(img));
      start++;
    }

    return imgs;
  };

  initSliderTransformStyleCheck = () => {
    const root = this.el.shadowRoot || this.el;
    const slideItems = root.querySelectorAll(".tns-item");
    if (this.autoWidth) {
      // check styles application
      const num = this.loop ? this.index : this.slideCount - 1;
      const _this = this;
      (function stylesApplicationCheck() {
        slideItems[num - 1].getBoundingClientRect().right.toFixed(2) ===
        slideItems[num].getBoundingClientRect().left.toFixed(2)
          ? _this.initSliderTransformCore()
          : setTimeout(function() {
              stylesApplicationCheck();
            }, 16);
      })();
    } else {
      this.initSliderTransformCore();
    }
  };

  setSlidePositions = () => {
    const root = this.el.shadowRoot || this.el;
    const slideItems = root.querySelectorAll(".tns-item");
    this.slidePositions = [0];
    var attr = this.isHorizontal ? "left" : "top",
      attr2 = this.isHorizontal ? "right" : "bottom",
      base = slideItems[0].getBoundingClientRect()[attr];

    slideItems.forEach((item, i) => {
      // skip the first slide
      if (i) {
        this.slidePositions.push(item.getBoundingClientRect()[attr] - base);
      }
      // add the end edge
      if (i === this.slideCountNew - 1) {
        this.slidePositions.push(item.getBoundingClientRect()[attr2] - base);
      }
    });
  };

  getFreeze() {
    if (!this.fixedWidth && !this.autoWidth) {
      var a = this.center
        ? this.perView - (this.perView - 1) / 2
        : this.perView;
      return this.slideCount <= a;
    }

    var width = this.fixedWidth
        ? ((this.fixedWidth as number) + this.gutter) * this.slideCount
        : this.slidePositions[this.slideCount],
      vp = this.edgePadding
        ? this.viewport + this.edgePadding * 2
        : this.viewport + this.gutter;

    if (this.center) {
      vp -= this.fixedWidth
        ? (this.viewport - (this.fixedWidth as number)) / 2
        : (this.viewport -
            (this.slidePositions[this.index + 1] -
              this.slidePositions[this.index] -
              this.gutter)) /
          2;
    }

    return width <= vp;
  }

  resetVariblesWhenDisable = condition => {
    if (condition) {
      this.touch = this.mouseDrag = this.arrowKeys = this.autoplay = this.autoplayHoverPause = this.autoplayResetOnVisibility = false;
    }
  };

  updateContentWrapperHeight() {
    const root = this.el.shadowRoot || this.el;
    const middleWrapper = root.querySelector(".tns-ovh");
    const innerWrapper = root.querySelector(".tns-inner");
    var wp = middleWrapper ? middleWrapper : innerWrapper;
    wp.style.height =
      this.slidePositions[this.index + this.perView] -
      this.slidePositions[this.index] +
      "px";
  }

  initSliderTransformCore = () => {
    // run Fn()s which are rely on image loading
    if (!this.isHorizontal || this.autoWidth) {
      this.setSlidePositions();

      if (this.autoWidth) {
        this.rightBoundary = this.getRightBoundary();
        if (this.freezable) {
          this.freeze = this.getFreeze();
        }
        this.indexMax = this.getIndexMax(); // <= slidePositions, rightBoundary <=
        this.resetVariblesWhenDisable(this.disabled || this.freeze);
      } else {
        this.updateContentWrapperHeight();
      }
    }
    //
    // initTools();
    // initEvents();
  };

  initSliderTransform = () => {
    // ## images loaded/failed
    const root = this.el.shadowRoot || this.el;
    const container = root.querySelector(".nova-slider__item");
    if (this.hasOption("autoHeight") || this.autoWidth || !this.isHorizontal) {
      var imgs = container.querySelectorAll("img");

      // add complete class if all images are loaded/failed
      imgs.forEach(img => {
        var src = img.src;

        if (src && src.indexOf("data:image") < 0) {
          addEvents(img, this.imgEvents);
          img.src = "";
          img.src = src;
          addClass(img, "loading");
        } else if (!this.lazyload) {
          this.imgLoaded(img);
        }
      });

      // All imgs are completed
      raf(() => {
        this.imgsLoadedCheck(Array.from(imgs), () => {
          this.imgsComplete = true;
        });
      });

      // Check imgs in window only for auto height
      if (!this.autoWidth && this.isHorizontal) {
        imgs = this.getImageArray(
          this.index,
          Math.min(this.index + this.perView - 1, this.slideCountNew - 1)
        );
      }

      this.lazyload
        ? this.initSliderTransformStyleCheck()
        : raf(() => {
            this.imgsLoadedCheck(
              Array.from(imgs),
              this.initSliderTransformStyleCheck
            );
          });
    } else {
      // update slider tools and events
      // initTools();
      // initEvents();
    }
  };

  getIndexMaxFunction = () => {
    const _this = this;
    if (_this.fixedWidth) {
      return function() {
        return _this.center && !_this.loop
          ? _this.slideCount - 1
          : Math.ceil(
              -_this.rightBoundary /
                ((_this.fixedWidth as number) + _this.gutter)
            );
      };
    } else if (_this.autoWidth) {
      return function() {
        for (var i = _this.slideCountNew; i--; ) {
          if (_this.slidePositions[i] >= -_this.rightBoundary) {
            return i;
          }
        }
      };
    } else {
      return function() {
        if (_this.center && _this.isCarousel && !_this.loop) {
          return _this.slideCount - 1;
        } else {
          return _this.loop || _this.isCarousel
            ? Math.max(0, _this.slideCountNew - Math.ceil(_this.perView))
            : _this.slideCountNew - 1;
        }
      };
    }
  };

  getIndexMax = this.getIndexMaxFunction();

  getHTMLELement = (selector: string): HTMLElement => {
    const root: HTMLElement = this.el.shadowRoot || this.el;
    return root.querySelector(selector);
  };

  updateArrowControls = () => {
    const controlsEvents = {
      click: this.onControlsClick
      //'keydown': onControlsKeydown
    };
    this.controlsContainer = this.getHTMLELement(".nova-c-carousel__arrows");
    this.prevButton = this.getHTMLELement(".nova-c-carousel__arrow--left");
    this.nextButton = this.getHTMLELement(".nova-c-carousel__arrow--right");
    if (this.prevButton && this.nextButton) {
      addEvents(this.prevButton, controlsEvents);
      addEvents(this.nextButton, controlsEvents);
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
    this.imgEvents = {
      load: this.onImgLoaded,
      error: this.onImgFailed
    };
    this.rightBoundary = this.fixedWidth ? this.getRightBoundary() : null;
    this.freeze = this.freezable && !this.autoWidth ? this.getFreeze() : false;
    this.viewport = this.getViewportWidth();
    this.indexMax = !this.autoWidth ? this.getIndexMax() : null;
    this.slideBy =
      this.slideBy === SLIDE_BY.PAGE.valueOf() ? this.perView : this.slideBy;
    this.updateTransformVariables();
  };

  getSlideWidthStyle = () => {
    var width;

    if (this.fixedWidth) {
      width = (this.fixedWidth as number) + this.gutter + "px";
    } else {
      if (!this.isCarousel) {
        this.perView = Math.floor(this.perView);
      }
      let dividend = this.isCarousel ? this.slideCountNew : this.perView;
      width = "calc(100% / " + dividend + ")";
    }

    return this.nested !== "inner" ? width : width + " !important";
  };

  getSlideItemStyle = () => {
    const width = this.getSlideWidthStyle();
    console.log(width);
    return {
      width,
      paddingRight: `${this.gutter}px`
    };
  };

  componentWillLoad() {
    this.updateLocalVariables();
    this.index = this.getIndex();
  }

  componentWillRender() {
    this.updateLocalVariables();
  }

  render() {
    const SliderItemComponent = this.getSliderItemComponent(this.variant);
    const slideId = getSlideId();
    const isPercentageLayoutSupported = percentageLayout();
    const calcPrefixCSS: string | boolean = calc();
    const containerStyle = this.getContainerStyle();
    const itemStyle = this.getSlideItemStyle();
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
        itemStyle={itemStyle}
      />
    );
  }

  componentDidRender() {
    this.updateArrowControls();
  }
}
