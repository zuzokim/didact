function createDom(fiber) {
  const dom =
         fiber.type == "TEXT_ELEMENT"
         ? document.createTextNode("") 
         : document.createElement(fiber.type)

  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
    dom[name] = fiber.props[name]
  })
  ​
  return dom
}



const isProperty = key => key !== "children"
const isGone = (prev, next) => key => !(key in next)
const isNew = (prev, next) => key => prev[key] !== next[key]

function updateDom(dom, prevProps, nextProps) {
  // TODO update props(new or changed)
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
    dom[name] = "" //delete old props
  })
  ​
  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
    dom[name] = nextProps[name] //set new props
  })

}

function commitRoot() {
  //TODO add nodes to dom
  deletions.forEach(commitWork)
  commitWork(workInProgressRoot.child)
  currentRoot = workInProgressRoot //last fiber tree we committed to the DOM
  workInProgressRoot = null 
}

//recursively append all the nodes to dom
function commitWork(fiber){
  if(!fiber) return;

  const domParent = fiber.parent.dom

  //reconcile--
  if(fiber.effectTag === 'PLACEMENT' && fiber.dom !== null){
      domParent.appendChild(fiber.dom)
  }else if(fiber.effectTag === 'UPDATE' && fiber.dom !== null){
      updateDom(
          fiber.dom,
          fiber.alternate.props,
          fiber.props
      )
  }else if(fiber.effectTag === 'DELETION'){
      domParent.removeChild(fiber.dom)
  }
  //--reconcile

  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

function render(element, container) {
  // track of the root of the fiber tree
    workInProgressRoot = {
      dom: container,
      props: {
        children: [element], //elements
      },
      alternate: currentRoot, //link to the old fiber committed in previous commit phase.
    }
    deletions = [] //due to wIPRoot doesn't have old fiber, need an array to keep track of the nodes we want to remove.
    nextUnitOfWork = workInProgressRoot

}
​
let nextUnitOfWork = null
let currentRoot = null
let workInProgressRoot = null
let deletions = null

//Then, when the browser is ready,
//it will call our workLoop and we’ll start working on the root.
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  // 더이상 nextUnitOfWork가 없는 경우, 전체 fiber tree를 최종적으로 dom에 커밋
  if(!nextUnitOfWork && workInProgressRoot){
    commitRoot();
  }

  requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)
​
function performUnitOfWork(fiber) {
  // TODO create & add new node to DOM 
  // track of the DOM node in the fiber.dom property
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  // TODO for each child, create new fibers
  const elements = fiber.props.children

  //extract code creating new fiber to reconcileChildren function
  reconcileChildren(fiber, elements)
  //     let index = 0
  //     let prevSibling = null
  //     ​
  //     while (index < elements.length) {
  //     const element = elements[index]
  //     ​
  //     const newFiber = {
  //         type: element.type,
  //         props: element.props,
  //         parent: fiber,
  //         dom: null,
  //     }

  //     // first child as child or else as sibling --> fiber tree
  //     if (index === 0) { 
  //         fiber.child = newFiber
  //     } else {
  //         prevSibling.sibling = newFiber
  //     }
  //     ​
  //     prevSibling = newFiber
  //     index++
  //     }


  // TODO search for the next unit of work 
  // from child -> sibling -> uncle
  if (fiber.child){
      return fiber.child
  }
  let nextFiber = fiber
  while(nextFiber){
    if(nextFiber.sibling){
        return nextFiber.sibling
    }
    nextFiber = nextFiber.parent
  }
}

function reconcileChildren(wipFiber, elements){
  // TODO compare oldFiber to element
  let index = 0
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child
  let prevSibling = null

  while (index < elements.length || oldFiber != null) {
    const element = elements[index]
    let newFiber = null

    const sameType =
        oldFiber &&
        element &&
        element.type == oldFiber.type
    ​
    if (sameType) {
    // TODO update the node 
      newFiber = {
        type: oldFiber.type,
        props: element.props, //같은 타입이라면, props만 update
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      }
    }
    if (element && !sameType) {
    // TODO add this node : 타입이 다른 새로운 엘리먼트가 존재하면 add
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      }
    }
    if (oldFiber && !sameType) {
    // TODO delete the oldFiber's node : 새로운 fiber 불필요
      oldFiber.effectTag = "DELETION"
      deletions.push(oldFiber)
    }

  }



}

