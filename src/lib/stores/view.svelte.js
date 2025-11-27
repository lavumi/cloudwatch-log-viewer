// 뷰 상태 관리 (검색 화면 / 결과 화면)
class ViewState {
  currentView = $state('search'); // 'search' | 'results'

  showResults() {
    this.currentView = 'results';
  }

  showSearch() {
    this.currentView = 'search';
  }

  get isSearchView() {
    return this.currentView === 'search';
  }

  get isResultsView() {
    return this.currentView === 'results';
  }
}

export const viewState = new ViewState();
