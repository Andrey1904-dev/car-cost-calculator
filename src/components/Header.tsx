type Page =
  | "expenses"
  | "statistics"
  | "history"
  | "car";

type HeaderProps = {
  activePage: Page;
  onPageChange: (page: Page) => void;
};

const navigation = [
  {
    id: "expenses" as Page,
    icon: "💰",
    label: "Расходы",
  },
  {
    id: "statistics" as Page,
    icon: "📊",
    label: "Статистика",
  },
  {
    id: "history" as Page,
    icon: "📅",
    label: "История",
  },
  {
    id: "car" as Page,
    icon: "🚗",
    label: "Автомобиль",
  },
];

function Header({
  activePage,
  onPageChange,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <button
          className="logo"
          onClick={() =>
            onPageChange("expenses")
          }
        >
          <span className="logo-icon">
            💰
          </span>

          <span className="logo-text">
            Мои расходы
          </span>
        </button>

        <nav className="navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${
                activePage === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onPageChange(item.id)
              }
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span className="nav-label">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;