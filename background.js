import { runFullCourse, stopRunForTab } from './solverOrchestrator.js';
import { triggerQuizSolver } from './quizSolver.js';
import { getCourseMaterials } from './courseraApi.js';
import { updateDashboard } from './dashboardStore.js';

chrome.tabs.onRemoved.addListener((tabId) => stopRunForTab(tabId));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStorage') {
    chrome.storage.local.get(['userId'], (data) => {
      sendResponse(data);
    });
    return true;
  }

  if (message.action === 'RUN_FULL_COURSE') {
    runFullCourse(message.slug, message.settings || {}, message.tabId)
      .catch((error) => updateDashboard(`Run failed: ${error.message}`, 'error', message.slug));
    sendResponse({ status: 'Course solver started.' });
    return false;
  }

  if (message.action === 'RUN_SINGLE_QUIZ') {
    getCourseMaterials(message.slug)
      .then((materials) => {
        const courseId = materials?.elements?.[0]?.id;
        if (!courseId) throw new Error('Could not find the Coursera course ID.');
        return triggerQuizSolver(courseId, message.itemId, message.settings || {}, message.tabId, message.slug, null, materials);
      })
      .catch((error) => updateDashboard(`Quiz solver failed: ${error.message}`, 'error', message.slug));
    sendResponse({ status: 'Quiz solver started.' });
    return false;
  }
});
