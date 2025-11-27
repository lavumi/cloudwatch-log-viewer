// 로그 그룹 관리
class LogGroups {
  list = $state([]);
  activeId = $state(null);

  constructor() {
    // 로컬 스토리지에서 로그 그룹 불러오기
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cwlogviewer-log-groups');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.list = parsed.list || [];
          this.activeId = parsed.activeId || null;
        } catch (e) {
          console.error('Failed to parse log groups:', e);
        }
      }
    }
  }

  add(name, region, alias = '') {
    const newGroup = {
      id: Date.now().toString(),
      name,
      region,
      alias,
      createdAt: new Date().toISOString(),
    };
    this.list = [...this.list, newGroup];

    // 첫 번째 그룹이면 자동으로 활성화
    if (this.list.length === 1) {
      this.activeId = newGroup.id;
    }

    this.save();
  }

  updateAlias(id, alias) {
    const group = this.list.find(g => g.id === id);
    if (group) {
      group.alias = alias;
      this.list = [...this.list]; // 반응성을 위해 새 배열 생성
      this.save();
    }
  }

  remove(id) {
    this.list = this.list.filter(g => g.id !== id);

    // 삭제된 그룹이 활성화되어 있었다면 활성화 해제
    if (this.activeId === id) {
      this.activeId = this.list.length > 0 ? this.list[0].id : null;
    }

    this.save();
  }

  setActive(id) {
    this.activeId = id;
    this.save();
  }

  get activeGroup() {
    return this.list.find(g => g.id === this.activeId) || null;
  }

  save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cwlogviewer-log-groups', JSON.stringify({
        list: this.list,
        activeId: this.activeId,
      }));
    }
  }
}

export const logGroups = new LogGroups();
