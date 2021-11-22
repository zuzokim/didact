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

function commitRoot() {
  //TODO add nodes to dom
  commitWork(workInProgressRoot.child)
  workInProgressRoot = null // 완료시점
}

//recursively append all the nodes to dom
function commitWork(fiber){
  if(!fiber) return;

  const domParent = fiber.parent.dom
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
    }
    nextUnitOfWork = workInProgressRoot

}
​
let nextUnitOfWork = null
let workInProgressRoot = null

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
  let index = 0
  let prevSibling = null
​
  while (index < elements.length) {
    const element = elements[index]
​
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }

    // first child as child or else as sibling --> fiber tree
    if (index === 0) { 
        fiber.child = newFiber
    } else {
        prevSibling.sibling = newFiber
    }
  ​
    prevSibling = newFiber
    index++
  }

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