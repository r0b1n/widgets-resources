import { RefObject, useEffect } from "react";

export function unBlockAbsoluteElement(
    element: HTMLElement,
    boundingRect: DOMRect,
    blockingElementRect: DOMRect
): void {
    if (
        boundingRect.top < blockingElementRect.bottom &&
        boundingRect.bottom >= blockingElementRect.bottom &&
        boundingRect.y + boundingRect.height < window.innerHeight
    ) {
        // Top of element is blocked
        if (
            boundingRect.left < blockingElementRect.right &&
            boundingRect.right >= blockingElementRect.right &&
            boundingRect.left >= blockingElementRect.left
        ) {
            // Top left of element is blocked
            element.style.top =
                getPixelValueAsNumber(element, "top") + blockingElementRect.bottom - boundingRect.top + "px";
            element.style.left =
                getPixelValueAsNumber(element, "left") + blockingElementRect.right - boundingRect.left + "px";
        } else if (
            boundingRect.right > blockingElementRect.left &&
            boundingRect.left <= blockingElementRect.left &&
            boundingRect.right <= blockingElementRect.right
        ) {
            // Top right of element is blocked
            element.style.top =
                getPixelValueAsNumber(element, "top") + blockingElementRect.bottom - boundingRect.top + "px";
            element.style.right =
                getPixelValueAsNumber(element, "right") + blockingElementRect.left - boundingRect.right + "px";
        } else {
            element.style.top =
                getPixelValueAsNumber(element, "top") + blockingElementRect.bottom - boundingRect.top + "px";
        }
    } else if (
        boundingRect.bottom > blockingElementRect.top &&
        boundingRect.top <= blockingElementRect.top &&
        boundingRect.y - boundingRect.height > 0
    ) {
        // Bottom of element is blocked
        if (
            boundingRect.left < blockingElementRect.right &&
            boundingRect.right >= blockingElementRect.right &&
            boundingRect.left >= blockingElementRect.left
        ) {
            // Bottom left of element is blocked
            element.style.bottom =
                getPixelValueAsNumber(element, "bottom") + blockingElementRect.top - boundingRect.bottom + "px";
            element.style.left =
                getPixelValueAsNumber(element, "left") + blockingElementRect.right - boundingRect.left + "px";
        } else if (
            boundingRect.right > blockingElementRect.left &&
            boundingRect.left <= blockingElementRect.left &&
            boundingRect.right <= blockingElementRect.right
        ) {
            // Bottom right of element is blocked
            element.style.bottom =
                getPixelValueAsNumber(element, "bottom") + blockingElementRect.top - boundingRect.bottom + "px";
            element.style.right =
                getPixelValueAsNumber(element, "right") + blockingElementRect.left - boundingRect.right + "px";
        } else {
            element.style.bottom =
                getPixelValueAsNumber(element, "bottom") + blockingElementRect.top - boundingRect.bottom + "px";
        }
    } else if (
        boundingRect.left < blockingElementRect.right &&
        boundingRect.left >= blockingElementRect.left &&
        boundingRect.right >= blockingElementRect.right
    ) {
        // Left of element is blocked
        element.style.left =
            getPixelValueAsNumber(element, "left") + blockingElementRect.right - boundingRect.left + "px";
    } else if (
        boundingRect.right > blockingElementRect.left &&
        boundingRect.left <= blockingElementRect.left &&
        boundingRect.right <= blockingElementRect.right
    ) {
        // Right of element is blocked
        element.style.right =
            getPixelValueAsNumber(element, "right") + blockingElementRect.left - boundingRect.right + "px";
    }
}

export function getPixelValueAsNumber(element: HTMLElement, prop: keyof CSSStyleDeclaration): number {
    const value = (getComputedStyle(element) as CSSStyleDeclaration)[prop] as string;
    const num = Number(value.split("px")[0]);
    return value ? num : 0;
}

export function isBehindRandomElement(
    elementSource: HTMLElement,
    boundingRect: DOMRect,
    offset = 3,
    excludeElementWithClass = ""
): HTMLElement | false {
    let excludeElements: HTMLElement[] = [];
    const left = boundingRect.left + offset;
    const right = boundingRect.right - offset;
    const top = boundingRect.top + offset;
    const bottom = boundingRect.bottom - offset;
    const elementTopLeft = document.elementFromPoint(left, top) as HTMLElement;
    const elementTopRight = document.elementFromPoint(right, top) as HTMLElement;
    const elementBottomLeft = document.elementFromPoint(left, bottom) as HTMLElement;
    const elementBottomRight = document.elementFromPoint(right, bottom) as HTMLElement;
    if (excludeElementWithClass) {
        excludeElementWithClass = excludeElementWithClass.replace(/\./g, "");
        excludeElements = [...(document.querySelectorAll(`.${excludeElementWithClass}`) as any)];
    }

    if (
        elementTopLeft &&
        elementTopLeft !== elementSource &&
        !elementTopLeft.classList.contains(excludeElementWithClass) &&
        (!excludeElements ||
            !excludeElements.map((elem: HTMLElement) => elem.contains(elementTopLeft)).filter(elem => elem).length) &&
        !elementSource.contains(elementTopLeft)
    ) {
        return elementTopLeft;
    }
    if (
        elementTopRight &&
        elementTopRight !== elementSource &&
        !elementTopRight.classList.contains(excludeElementWithClass) &&
        (!excludeElements ||
            !excludeElements.map((elem: HTMLElement) => elem.contains(elementTopRight)).filter(elem => elem).length) &&
        !elementSource.contains(elementTopRight)
    ) {
        return elementTopRight;
    }
    if (
        elementBottomLeft &&
        elementBottomLeft !== elementSource &&
        !elementBottomLeft.classList.contains(excludeElementWithClass) &&
        (!excludeElements ||
            !excludeElements.map((elem: HTMLElement) => elem.contains(elementBottomLeft)).filter(elem => elem)
                .length) &&
        !elementSource.contains(elementBottomLeft)
    ) {
        return elementBottomLeft;
    }
    if (
        elementBottomRight &&
        elementBottomRight !== elementSource &&
        !elementBottomLeft.classList.contains(excludeElementWithClass) &&
        (!excludeElements ||
            !excludeElements.map((elem: HTMLElement) => elem.contains(elementBottomLeft)).filter(elem => elem)
                .length) &&
        !elementSource.contains(elementBottomRight)
    ) {
        return elementBottomRight;
    }

    return false;
}

export function isBehindElement(element: HTMLElement, blockingElement: HTMLElement, offset = 3): boolean {
    const elementRect: DOMRect = element.getBoundingClientRect();
    const blockingElementRect: DOMRect = blockingElement.getBoundingClientRect();
    const left = elementRect.left + offset;
    const right = elementRect.right - offset;
    const top = elementRect.top + offset;
    const bottom = elementRect.bottom - offset;

    return (
        (left < blockingElementRect.right && left > blockingElementRect.left) ||
        (right > blockingElementRect.left && right < blockingElementRect.right) ||
        (top < blockingElementRect.bottom && top > blockingElementRect.top) ||
        (bottom > blockingElementRect.top && bottom < blockingElementRect.bottom)
    );
}

export function isElementVisibleByUser(element: HTMLElement): boolean {
    const style: CSSStyleDeclaration = getComputedStyle(element);
    if (style.display === "none") return false;
    if (style.visibility && style.visibility !== "visible") return false;
    if (style.opacity && Number(style.opacity) < 0.1) return false;
    const rect = element.getBoundingClientRect();
    if (element.offsetWidth + element.offsetHeight + rect.height + rect.width === 0) {
        return false;
    }
    const elementCenter = {
        x: rect.left + element.offsetWidth / 2,
        y: rect.top + element.offsetHeight / 2
    };
    if (elementCenter.x < 0) return false;
    if (elementCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elementCenter.y < 0) return false;
    if (elementCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elementCenter.x, elementCenter.y) as HTMLElement;
    do {
        if (pointContainer === element) {
            return true;
        } else {
            pointContainer = pointContainer.parentElement as HTMLElement;
        }
    } while (pointContainer.parentElement);
    return false;
}

export function isElementPartiallyOffScreen(rect: DOMRect): boolean {
    return (
        rect.x < 0 || rect.y < 0 || rect.x + rect.width > window.innerWidth || rect.y + rect.height > window.innerHeight
    );
}

export function moveAbsoluteElementOnScreen(element: HTMLElement, rect: DOMRect): DOMRect {
    if (rect.x < 0) {
        const leftValue = Math.round(getPixelValueAsNumber(element, "left") - rect.x);
        element.style.left = leftValue + "px";
        rect.x += leftValue;
    }
    if (rect.y < 0) {
        const topValue = Math.round(getPixelValueAsNumber(element, "top") - rect.y);
        element.style.top = topValue + "px";
        rect.y += topValue;
    }
    if (rect.x + rect.width > window.innerWidth) {
        const rightValue = Math.round(
            getPixelValueAsNumber(element, "right") + (rect.x + rect.width - window.innerWidth)
        );
        element.style.right = rightValue + "px";
        rect.x -= rightValue;
    }
    if (rect.y + rect.height > window.innerHeight) {
        const bottomValue = Math.round(
            getPixelValueAsNumber(element, "bottom") + (rect.y + rect.height - window.innerHeight)
        );
        element.style.bottom = bottomValue + "px";
        rect.y -= bottomValue;
    }
    return DOMRect.fromRect(rect);
}

export function handleOnClickOutsideElement(ref: RefObject<HTMLDivElement>, handler: () => void): void {
    useEffect(() => {
        const listener = (event: MouseEvent & { target: Node | null }): void => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler();
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}
