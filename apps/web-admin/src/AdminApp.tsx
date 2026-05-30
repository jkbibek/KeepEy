import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  createLaptop as createLaptopRecord,
  createTablet as createTabletRecord,
  deleteLaptop as deleteLaptopRecord,
  deleteTablet as deleteTabletRecord,
  fetchLaptops,
  fetchRentalLogs,
  fetchTablets,
  statusLabels,
  statusOrder,
  statusTone,
  updateDeviceIssue,
} from "./data";
import type { DeviceAsset, Laptop, LaptopStatus, RentalLog, Tablet } from "./types";

type ActionPanel = "add" | "delete" | null;
type PageTab = "all" | "available" | "rented" | "logs";
type Language = "ko" | "en";
type DeviceKind = "laptop" | "tablet";
type IssueTarget = {
  device: DeviceAsset;
  deviceKind: DeviceKind;
};

const copy = {
  ko: {
    localeName: "English",
    languageLabel: "Switch language to English",
    title: "전체 노트북 확인",
    globalFilter: "통합 필터",
    filterPlaceholder: "애플, 202, LIB-202, 대여 중, 학생번호",
    tabs: {
      all: "전체 노트북",
      available: "대여 가능",
      rented: "대여 중",
      logs: "반납 로그",
    },
    summary: {
      total: "전체",
      available: "대여 가능",
      rented: "대여 중",
      review: "수리/검토",
      broken: "고장",
    },
    staffNoteTitle: "상태 기준",
    staffNote:
      "대여 앱에서 전송된 장비 상태와 반납 점검 결과가 이 화면에 반영됩니다.",
    inventory: "Inventory",
    laptopList: "노트북 목록",
    logList: "반납 로그",
    addLaptop: "노트북 추가",
    deleteLaptop: "노트북 삭제",
    addTablet: "태블릿 추가",
    deleteTablet: "태블릿 삭제",
    editIssue: "최근 이슈 수정",
    saveIssue: "저장",
    issuePlaceholder: "이슈 내용을 입력하세요.",
    close: "닫기",
    closeNotice: "알림 닫기",
    addExisting: (id: string) => `${id}는 이미 등록되어 있습니다.`,
    addNotice: (id: string) => `${id} 노트북을 추가했습니다.`,
    deleteMissing: (id: string) => `${id}를 찾을 수 없습니다.`,
    deleteNotice: (id: string) => `${id} 노트북을 삭제했습니다.`,
    fields: {
      laptopId: "노트북 번호",
      brand: "기종",
      model: "모델명",
      purchaseYear: "구매 연도",
      purchaseMonth: "구매 월",
      deleteLaptopId: "삭제할 노트북 번호",
    },
    brands: ["애플", "삼성", "HP", "ASUS"],
    add: "추가",
    delete: "삭제",
    deleteWarning:
      "삭제는 현재 화면의 임시 목록에서 즉시 제거됩니다. 실제 운영에서는 확인 절차와 감사 로그가 필요합니다.",
    emptyLaptop: "조건에 맞는 노트북이 없습니다.",
    emptyLog: "조건에 맞는 로그가 없습니다.",
    emptyHint: "상단 필터를 지우거나 다른 상태 탭을 선택하세요.",
    loadingMessage: "데이터를 불러오는 중입니다",
    loadingHint: "최신 장비·반납 정보를 API에서 가져오고 있습니다.",
    table: {
      brand: "기종",
      laptopId: "노트북 번호",
      purchaseDate: "구매시기",
      status: "상태",
      student: "대여 학생",
      issue: "최근 이슈",
      updated: "업데이트",
      studentId: "학생번호",
      returnedAt: "반납 시간",
      result: "결과",
    },
  },
  en: {
    localeName: "Korean",
    languageLabel: "Switch language to Korean",
    title: "Laptop inventory",
    globalFilter: "Global filter",
    filterPlaceholder: "Apple, 202, LIB-202, rented, student ID",
    tabs: {
      all: "All laptops",
      available: "Available",
      rented: "Rented",
      logs: "Return logs",
    },
    summary: {
      total: "Total",
      available: "Available",
      rented: "Rented",
      review: "Repair/review",
      broken: "Broken",
    },
    staffNoteTitle: "Status source",
    staffNote:
      "Device status and return inspection results sent from the rent app are reflected here.",
    inventory: "Inventory",
    laptopList: "Laptop list",
    logList: "Return logs",
    addLaptop: "Add laptop",
    deleteLaptop: "Delete laptop",
    addTablet: "Add tablet",
    deleteTablet: "Delete tablet",
    editIssue: "Edit latest issue",
    saveIssue: "Save",
    issuePlaceholder: "Enter the latest issue.",
    close: "Close",
    closeNotice: "Close notice",
    addExisting: (id: string) => `${id} is already registered.`,
    addNotice: (id: string) => `${id} has been added.`,
    deleteMissing: (id: string) => `${id} was not found.`,
    deleteNotice: (id: string) => `${id} has been deleted.`,
    fields: {
      laptopId: "Laptop number",
      brand: "Brand",
      model: "Model",
      purchaseYear: "Purchase year",
      purchaseMonth: "Purchase month",
      deleteLaptopId: "Laptop number to delete",
    },
    brands: ["Apple", "Samsung", "HP", "ASUS"],
    add: "Add",
    delete: "Delete",
    deleteWarning:
      "This removes the laptop from the temporary list immediately. A production flow should include confirmation and audit logs.",
    emptyLaptop: "No laptops match the current filters.",
    emptyLog: "No logs match the current filters.",
    emptyHint: "Clear the top filter or choose another status tab.",
    loadingMessage: "Loading admin data",
    loadingHint: "Fetching the latest device and return records from the API.",
    table: {
      brand: "Brand",
      laptopId: "Laptop number",
      purchaseDate: "Purchased",
      status: "Status",
      student: "Student",
      issue: "Latest issue",
      updated: "Updated",
      studentId: "Student ID",
      returnedAt: "Returned",
      result: "Result",
    },
  },
} satisfies Record<Language, Record<string, unknown>>;

const pageTabs: PageTab[] = ["all", "available", "rented", "logs"];

const deviceCopy = {
  ko: {
    laptopTitle: "전체 노트북 확인",
    tabletTitle: "전체 태블릿 확인",
    laptopTable: "노트북 목록",
    tabletTable: "태블릿 목록",
    laptopNumber: "노트북 번호",
    tabletNumber: "태블릿 번호",
    allLaptop: "전체 노트북",
    allTablet: "전체 태블릿",
    laptopToggle: "노트북 확인",
    tabletToggle: "태블릿 확인",
    laptopLabel: "노트북",
    tabletLabel: "태블릿",
    emptyLaptop: "조건에 맞는 노트북이 없습니다.",
    emptyTablet: "조건에 맞는 태블릿이 없습니다.",
  },
  en: {
    laptopTitle: "Laptop inventory",
    tabletTitle: "Tablet inventory",
    laptopTable: "Laptop list",
    tabletTable: "Tablet list",
    laptopNumber: "Laptop number",
    tabletNumber: "Tablet number",
    allLaptop: "All laptops",
    allTablet: "All tablets",
    laptopToggle: "Laptop inventory",
    tabletToggle: "Tablet inventory",
    laptopLabel: "Laptop",
    tabletLabel: "Tablet",
    emptyLaptop: "No laptops match the current filters.",
    emptyTablet: "No tablets match the current filters.",
  },
} satisfies Record<Language, Record<string, string>>;

const brandLabels: Record<Language, Record<string, string>> = {
  ko: {
    애플: "애플",
    삼성: "삼성",
    Apple: "애플",
    Samsung: "삼성",
    HP: "HP",
    ASUS: "ASUS",
  },
  en: {
    애플: "Apple",
    삼성: "Samsung",
    Apple: "Apple",
    Samsung: "Samsung",
    HP: "HP",
    ASUS: "ASUS",
  },
};

const getBrandLabel = (brand: string, language: Language) =>
  brandLabels[language][brand] ?? brand;

const getBrandSearchAliases = (brand: string) => {
  if (brand === "애플" || brand === "Apple") return ["애플", "Apple"];
  if (brand === "삼성" || brand === "Samsung") return ["삼성", "Samsung"];
  return [brand];
};

const formatMonth = (year: number, month: number) =>
  `${year}.${String(month).padStart(2, "0")}`;

const formatDateTime = (value: string, language: Language) =>
  new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

const normalize = (value: string) => value.trim().toLowerCase();

const createLaptopFromForm = (form: HTMLFormElement): Laptop => {
  const formData = new FormData(form);

  return {
    id: String(formData.get("id") ?? "").trim().toUpperCase(),
    brand: String(formData.get("brand") ?? "").trim(),
    model: String(formData.get("model") ?? "").trim(),
    purchaseYear: Number(formData.get("purchaseYear")),
    purchaseMonth: Number(formData.get("purchaseMonth")),
    status: "available",
    currentStudentId: null,
    currentRentId: null,
    lastIssueSummary: null,
    updatedAt: new Date().toISOString(),
  };
};

export function AdminApp() {
  const [language, setLanguage] = useState<Language>("ko");
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [tablets, setTablets] = useState<Tablet[]>([]);
  const [rentalLogs, setRentalLogs] = useState<RentalLog[]>([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<PageTab>("all");
  const [deviceKind, setDeviceKind] = useState<DeviceKind>("laptop");
  const [panel, setPanel] = useState<ActionPanel>(null);
  const [issueTarget, setIssueTarget] = useState<IssueTarget | null>(null);
  const [issueDraft, setIssueDraft] = useState("");
  const [isIssueEditing, setIsIssueEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const text = copy[language] as typeof copy.ko;
  const deviceText = deviceCopy[language];
  const labels = statusLabels[language];
  const activeDevices = deviceKind === "laptop" ? laptops : tablets;
  const titleText = deviceKind === "laptop" ? deviceText.laptopTitle : deviceText.tabletTitle;
  const listTitle = deviceKind === "laptop" ? deviceText.laptopTable : deviceText.tabletTable;
  const deviceNumberLabel = deviceKind === "laptop" ? deviceText.laptopNumber : deviceText.tabletNumber;
  const emptyDeviceMessage = deviceKind === "laptop" ? deviceText.emptyLaptop : deviceText.emptyTablet;
  const addDeviceLabel = deviceKind === "laptop" ? text.addLaptop : text.addTablet;
  const deleteDeviceLabel = deviceKind === "laptop" ? text.deleteLaptop : text.deleteTablet;

  async function refreshData() {
    const [nextLaptops, nextTablets, nextLogs] = await Promise.all([
      fetchLaptops(),
      fetchTablets(),
      fetchRentalLogs(),
    ]);

    setLaptops(nextLaptops);
    setTablets(nextTablets);
    setRentalLogs(nextLogs);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [nextLaptops, nextTablets, nextLogs] = await Promise.all([
          fetchLaptops(),
          fetchTablets(),
          fetchRentalLogs(),
        ]);

        if (!active) return;

        setLaptops(nextLaptops);
        setTablets(nextTablets);
        setRentalLogs(nextLogs);
      } catch {
        if (active) {
          setNotice("Admin data could not be loaded. Start the API server with npm run api.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const getSearchText = (laptop: DeviceAsset) =>
    [
      laptop.id,
      ...getBrandSearchAliases(laptop.brand),
      laptop.model,
      laptop.purchaseYear,
      laptop.purchaseMonth,
      formatMonth(laptop.purchaseYear, laptop.purchaseMonth),
      labels[laptop.status],
      laptop.status,
      laptop.currentStudentId,
      laptop.lastIssueSummary,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

  const counts = useMemo(() => {
    const countBy = (status: LaptopStatus) =>
      activeDevices.filter((device) => device.status === status).length;

    return {
      total: activeDevices.length,
      available: countBy("available"),
      rented: countBy("rented"),
      repairing: countBy("repairing"),
      issueFound: countBy("issue_found"),
      broken: countBy("broken"),
      logs: rentalLogs.filter((log) => log.returnedAt && log.result !== "rented").length,
    };
  }, [activeDevices, rentalLogs]);

  const filteredDevices = useMemo(() => {
    const normalizedQuery = normalize(query);

    return activeDevices
      .filter((laptop) => {
        if (activeTab === "available") return laptop.status === "available";
        if (activeTab === "rented") return laptop.status === "rented";
        return activeTab !== "logs";
      })
      .filter((laptop) => {
        if (!normalizedQuery) return true;
        return getSearchText(laptop).includes(normalizedQuery);
      })
      .sort(
        (a, b) =>
          statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status) ||
          a.id.localeCompare(b.id),
      );
  }, [activeDevices, activeTab, labels, query]);

  const filteredLogs = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (activeTab !== "logs") return [];

    return rentalLogs
      .filter((log) => log.returnedAt && log.result !== "rented")
      .filter((log) => {
      if (!normalizedQuery) return true;

      const textValue = [
        log.laptopId,
        log.studentId,
        log.returnedAt,
        log.result,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return textValue.includes(normalizedQuery);
    });
  }, [activeTab, query]);

  const getTabCount = (id: PageTab) => {
    if (id === "all") return counts.total;
    if (id === "available") return counts.available;
    if (id === "rented") return counts.rented;
    return counts.logs;
  };

  const handleAddLaptop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const laptop = createLaptopFromForm(event.currentTarget);
    if (!laptop.id || !laptop.brand || !laptop.model) return;

    if (activeDevices.some((item) => item.id === laptop.id)) {
      setNotice(text.addExisting(laptop.id));
      return;
    }

    if (deviceKind === "laptop") {
      await createLaptopRecord(laptop);
    } else {
      await createTabletRecord(laptop);
    }
    await refreshData();
    setPanel(null);
    setNotice(text.addNotice(laptop.id));
  };

  const handleDeleteLaptop = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = String(formData.get("id") ?? "").trim().toUpperCase();
    if (!id) return;

    if (!activeDevices.some((item) => item.id === id)) {
      setNotice(text.deleteMissing(id));
      return;
    }

    if (deviceKind === "laptop") {
      await deleteLaptopRecord(id);
    } else {
      await deleteTabletRecord(id);
    }
    await refreshData();
    setPanel(null);
    setNotice(text.deleteNotice(id));
  };

  function openIssueCard(device: DeviceAsset) {
    setIssueTarget({ device, deviceKind });
    setIssueDraft(device.lastIssueSummary ?? "");
    setIsIssueEditing(false);
  }

  async function handleSaveIssue() {
    if (!issueTarget) return;

    await updateDeviceIssue(
      issueTarget.deviceKind,
      issueTarget.device.id,
      issueTarget.device.status,
      issueDraft,
    );
    await refreshData();
    setIssueTarget(null);
    setIssueDraft("");
    setIsIssueEditing(false);
    setNotice(`${issueTarget.device.id} issue updated.`);
  }

  return (
    <main className={`admin-shell locale-${language}`}>
      <header className="topbar" aria-label="KeepEy Admin top navigation">
        <div className="brand-lockup">
          <img className="brand-logo" src="/assets/keepey-logo-transparent.png" alt="KeepEy" />
          <div>
            <p className="eyebrow">KeepEy Admin</p>
            <div className="title-row">
              <h1>{titleText}</h1>
              <div className="device-switch" role="group" aria-label="Inventory device type">
                <button
                  className={deviceKind === "laptop" ? "device-switch-button active" : "device-switch-button"}
                  type="button"
                  aria-label={deviceText.laptopToggle}
                  aria-pressed={deviceKind === "laptop"}
                  title={deviceText.laptopToggle}
                  onClick={() => {
                    setDeviceKind("laptop");
                    setActiveTab("all");
                  }}
                >
                  <LaptopIcon />
                </button>
                <button
                  className={deviceKind === "tablet" ? "device-switch-button active" : "device-switch-button"}
                  type="button"
                  aria-label={deviceText.tabletToggle}
                  aria-pressed={deviceKind === "tablet"}
                  title={deviceText.tabletToggle}
                  onClick={() => {
                    setDeviceKind("tablet");
                    setActiveTab("all");
                    setPanel(null);
                  }}
                >
                  <TabletIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="topbar-tools">
          <button
            className="language-icon-button"
            type="button"
            aria-label={text.languageLabel}
            title={text.languageLabel}
            onClick={() => setLanguage((current) => (current === "ko" ? "en" : "ko"))}
          >
            <GlobeIcon />
            <span>{language === "ko" ? "EN" : "KO"}</span>
          </button>

          <label className="global-filter">
            <span>{text.globalFilter}</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={text.filterPlaceholder}
            />
          </label>
        </div>
      </header>

      <section className="summary-grid" aria-label="Laptop status summary">
        <SummaryCard label={text.summary.total} value={counts.total} />
        <SummaryCard label={text.summary.available} value={counts.available} tone="success" />
        <SummaryCard label={text.summary.rented} value={counts.rented} tone="info" />
        <SummaryCard label={text.summary.review} value={counts.repairing + counts.issueFound} tone="warning" />
        <SummaryCard label={text.summary.broken} value={counts.broken} tone="danger" />
      </section>

      <section className="workspace">
        <aside className="sidebar" aria-label="Admin pages">
          <nav className="page-tabs">
            {pageTabs.map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "tab active" : "tab"}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                <span>{tab === "all" ? (deviceKind === "laptop" ? deviceText.allLaptop : deviceText.allTablet) : text.tabs[tab]}</span>
                <span className="tab-count">{getTabCount(tab)}</span>
              </button>
            ))}
          </nav>

          <div className="staff-note">
            <strong>{text.staffNoteTitle}</strong>
            <p>{text.staffNote}</p>
          </div>
        </aside>

        <section className="content-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">{text.inventory}</p>
              <h2>{activeTab === "logs" ? text.logList : listTitle}</h2>
            </div>

            {activeTab !== "logs" && (
              <div className="actions">
                <button className="button secondary" onClick={() => setPanel("delete")} type="button">
                  {deleteDeviceLabel}
                </button>
                <button className="button primary" onClick={() => setPanel("add")} type="button">
                  {addDeviceLabel}
                </button>
              </div>
            )}
          </div>

          {notice && (
            <div className="notice" role="status">
              {notice}
              <button onClick={() => setNotice("")} type="button" aria-label={text.closeNotice}>
                {text.close}
              </button>
            </div>
          )}

          {activeTab === "logs" ? (
            loading ? (
              <LoadingState message={text.loadingMessage} hint={text.loadingHint} />
            ) : (
              <LogTable logs={filteredLogs} text={text} language={language} />
            )
          ) : loading ? (
            <LoadingState message={text.loadingMessage} hint={text.loadingHint} />
          ) : (
            <DeviceTable
              devices={filteredDevices}
              text={text}
              language={language}
              labels={labels}
              deviceNumberLabel={deviceNumberLabel}
              emptyMessage={emptyDeviceMessage}
              onIssueClick={openIssueCard}
            />
          )}
        </section>
      </section>

      {panel === "add" && (
        <ActionDrawer title={addDeviceLabel} closeLabel={text.close} onClose={() => setPanel(null)}>
          <form className="drawer-form" onSubmit={handleAddLaptop}>
            <label>
              <span>{text.fields.laptopId}</span>
              <input name="id" placeholder={deviceKind === "laptop" ? "LIB-701" : "TAB-701"} required />
            </label>
            <label>
              <span>{text.fields.brand}</span>
              <select name="brand" required defaultValue={text.brands[0]}>
                {text.brands.map((brand) => (
                  <option key={brand}>{brand}</option>
                ))}
              </select>
            </label>
            <label>
              <span>{text.fields.model}</span>
              <input name="model" placeholder="MacBook Air M3" required />
            </label>
            <div className="form-row">
              <label>
                <span>{text.fields.purchaseYear}</span>
                <input name="purchaseYear" type="number" min="2020" max="2030" defaultValue="2026" required />
              </label>
              <label>
                <span>{text.fields.purchaseMonth}</span>
                <input name="purchaseMonth" type="number" min="1" max="12" defaultValue="5" required />
              </label>
            </div>
            <button className="button primary wide" type="submit">
              {text.add}
            </button>
          </form>
        </ActionDrawer>
      )}

      {panel === "delete" && (
        <ActionDrawer title={deleteDeviceLabel} closeLabel={text.close} onClose={() => setPanel(null)}>
          <form className="drawer-form" onSubmit={handleDeleteLaptop}>
            <label>
              <span>{text.fields.deleteLaptopId}</span>
              <input name="id" placeholder={deviceKind === "laptop" ? "LIB-202" : "TAB-102"} required />
            </label>
            <p className="danger-copy">{text.deleteWarning}</p>
            <button className="button danger wide" type="submit">
              {text.delete}
            </button>
          </form>
        </ActionDrawer>
      )}

      {issueTarget && (
        <IssueCard
          target={issueTarget}
          text={text}
          deviceKindLabel={issueTarget.deviceKind === "laptop" ? deviceText.laptopLabel : deviceText.tabletLabel}
          closeLabel={text.close}
          draft={issueDraft}
          isEditing={isIssueEditing}
          onDraftChange={setIssueDraft}
          onEdit={() => setIsIssueEditing(true)}
          onSave={handleSaveIssue}
          onClose={() => setIssueTarget(null)}
        />
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <article className={`summary-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DeviceTable({
  devices,
  text,
  language,
  labels,
  deviceNumberLabel,
  emptyMessage,
  onIssueClick,
}: {
  devices: DeviceAsset[];
  text: typeof copy.ko;
  language: Language;
  labels: Record<LaptopStatus, string>;
  deviceNumberLabel: string;
  emptyMessage: string;
  onIssueClick: (device: DeviceAsset) => void;
}) {
  if (devices.length === 0) {
    return <EmptyState message={emptyMessage} hint={text.emptyHint} />;
  }

  return (
    <div className="table-frame">
      <table>
        <thead>
          <tr>
            <th>{text.table.brand}</th>
            <th className="laptop-id-column">{deviceNumberLabel}</th>
            <th>{text.table.purchaseDate}</th>
            <th>{text.table.status}</th>
            <th>{text.table.student}</th>
            <th>{text.table.issue}</th>
            <th>{text.table.updated}</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device.id}>
              <td>
                <div className="device-cell">
                  <strong>{getBrandLabel(device.brand, language)}</strong>
                  <span>{device.model}</span>
                </div>
              </td>
              <td className="mono laptop-id-column">{device.id}</td>
              <td>{formatMonth(device.purchaseYear, device.purchaseMonth)}</td>
              <td>
                <span className={`status-badge ${statusTone[device.status]}`}>
                  {labels[device.status]}
                </span>
              </td>
              <td className="mono muted">{device.currentStudentId ?? "-"}</td>
              <td className="issue-cell">
                <button className="issue-link" type="button" onClick={() => onIssueClick(device)}>
                  <span>{device.lastIssueSummary ?? "-"}</span>
                  <EditIcon />
                </button>
              </td>
              <td>{formatDateTime(device.updatedAt, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LogTable({
  logs,
  text,
  language,
}: {
  logs: RentalLog[];
  text: typeof copy.ko;
  language: Language;
}) {
  if (logs.length === 0) {
    return <EmptyState message={text.emptyLog} hint={text.emptyHint} />;
  }

  return (
    <div className="table-frame">
      <table>
        <thead>
          <tr>
            <th>{text.table.studentId}</th>
            <th className="laptop-id-column">{text.table.laptopId}</th>
            <th>{text.table.returnedAt}</th>
            <th>{text.table.result}</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="mono">{log.studentId}</td>
              <td className="mono laptop-id-column">{log.laptopId}</td>
              <td>{log.returnedAt ? formatDateTime(log.returnedAt, language) : "-"}</td>
              <td>{log.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="empty-state">
      <span className="empty-state-mark" aria-hidden="true">
        <EmptyTrayIcon />
      </span>
      <strong>{message}</strong>
      <span>{hint}</span>
    </div>
  );
}

function LoadingState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="loading-state" aria-live="polite" aria-busy="true">
      <div className="loading-skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <strong>{message}</strong>
      <span>{hint}</span>
    </div>
  );
}

function EmptyTrayIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M4 8h16l-1.2 9.6A2 2 0 0 1 16.82 19H7.18a2 2 0 0 1-1.98-1.4L4 8Z" />
      <path d="M9 11v5M15 11v5M10 4h4l1 4H9l1-4Z" />
    </svg>
  );
}

function ActionDrawer({
  children,
  title,
  closeLabel,
  onClose,
}: {
  children: ReactNode;
  title: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="drawer-backdrop" role="presentation">
      <aside className="drawer" aria-label={title}>
        <div className="drawer-header">
          <h2>{title}</h2>
          <button onClick={onClose} type="button" aria-label={closeLabel}>
            {closeLabel}
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

function IssueCard({
  target,
  text,
  deviceKindLabel,
  closeLabel,
  draft,
  isEditing,
  onDraftChange,
  onEdit,
  onSave,
  onClose,
}: {
  target: IssueTarget;
  text: typeof copy.ko;
  deviceKindLabel: string;
  closeLabel: string;
  draft: string;
  isEditing: boolean;
  onDraftChange: (value: string) => void;
  onEdit: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div className="drawer-backdrop issue-backdrop" role="presentation">
      <section className="issue-card" aria-label={text.editIssue}>
        <div className="issue-card-header">
          <div>
            <p className="eyebrow">{deviceKindLabel}</p>
            <h2>{target.device.id}</h2>
          </div>
          <div className="issue-card-actions">
            <button className="icon-button" type="button" aria-label={text.editIssue} onClick={onEdit}>
              <EditIcon />
            </button>
            <button className="button secondary" type="button" onClick={onClose}>
              {closeLabel}
            </button>
          </div>
        </div>

        <div className="issue-card-body">
          <span>{text.table.issue}</span>
          {isEditing ? (
            <textarea
              value={draft}
              placeholder={text.issuePlaceholder}
              onChange={(event) => onDraftChange(event.target.value)}
              autoFocus
            />
          ) : (
            <p>{target.device.lastIssueSummary || "-"}</p>
          )}
        </div>

        {isEditing ? (
          <button className="button primary wide" type="button" onClick={onSave}>
            {text.saveIssue}
          </button>
        ) : null}
      </section>
    </div>
  );
}

function EditIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M4 20h4.5L19 9.5 14.5 5 4 15.5V20z" />
      <path d="M13.5 6 18 10.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21" />
      <path d="M12 3c-2.5 2.6-3.8 5.6-3.8 9S9.5 18.4 12 21" />
    </svg>
  );
}

function LaptopIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M5 6.5h14v9H5z" />
      <path d="M3.5 18h17" />
      <path d="M8.5 18h7" />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <rect x="7" y="3.5" width="10" height="17" rx="2" />
      <path d="M11 17.5h2" />
    </svg>
  );
}
