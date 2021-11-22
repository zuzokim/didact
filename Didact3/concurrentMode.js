//requestIdleCallback(callback) => 메인 스레드가 대기 상태일 때 브라우저가 callback 실행
//deadline.timeRemaining(): returns the estimated number of milliseconds remaining in the current idle period.
//https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline/timeRemaining

let nextUnitOfWork = null
​
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  requestIdleCallback(workLoop)
}
​
requestIdleCallback(workLoop)
​
function performUnitOfWork(nextUnitOfWork) {
  // TODO
}
