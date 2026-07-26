import * as React from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { createStyles, Theme, makeStyles } from "@material-ui/core/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useMediaQuery from "@mui/material/useMediaQuery";
import MenuList from "@mui/material/MenuList";
import {
  AdvocacyIcon,
  CustomersIcon,
  DashboardIcon,
  OrdersIcon,
  OrdersIconWhite,
  ProductsIcon,
  ReportsIcon,
  OrganizationsIcon,
  BrandsIcon,
  LogoutIcon
} from "../icons";
import MuiIcons from "../icons/MuiIcons";
import { useModal } from "../../Hooks/useModal";
import SwitchOrgModal from "./SwtichOrgModal";
import BrandPoper from "./BrandPoper";
// We later need to delete this.
// import placeholderSvg from "./placeholder.svg";
import { Button, Typography } from "@material-ui/core";
import { UserContext } from "../../Context/AuthContext";
import { DrawerContext } from "../../Context/DrawerContext";

export const drawerWidth = 260;

const navLinks = [
  { to: "/", title: "Dashboard", Icon: DashboardIcon },
  { to: "/prescriptions", title: "Prescriptions", Icon: ReportsIcon },
  { to: "/orders", title: "Orders", Icon: OrdersIcon },
  { to: "/customers", title: "Customers", Icon: CustomersIcon },
  { to: "/products", title: "Products", Icon: ProductsIcon },
  { to: "/reports", title: "Reports", Icon: ReportsIcon },
  { to: "/purchase-orders", title: "Purchase Orders", Icon: OrdersIcon },
  { to: "/approved-users", title: "Approved Users", Icon: CustomersIcon }
];
const adminLinks = [
  {
    to: "/admin/organizations",
    title: "Organizations",
    Icon: OrganizationsIcon,
    disabled: false
  },
  { to: "/admin/brands", title: "Brands", Icon: BrandsIcon, disabled: false },
  { to: "/admin/vendors", title: "vendors", Icon: CustomersIcon, disabled: false },
  { to: "/admin/users", title: "Users", Icon: CustomersIcon, disabled: false },
  { to: "/admin/warehouses", title: "Warehouses", Icon: BrandsIcon, disabled: false },
  { to: "/admin/users", title: "Users", Icon: CustomersIcon, disabled: false },
  {
    to: "/admin/my-inventory",
    title: "My Inventory",
    Icon: ProductsIcon,
    disabled: false
  }
];
const otherLinks = [{ to: "/trash", title: "Trash", Icon: CustomersIcon }];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      width: drawerWidth,
      position: "sticky",
      top: 0,
      bottom: 0,
      left: 0,
      height: "100vh",
      flexShrink: 0,
      background: theme.palette.gray.grayBg,
      padding: 0,
      overflowY: "hidden",
      overflowX: "hidden"
    },
    truncate: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      width: "85%",
      textOverflow: "ellipsis"
    },
    content: {
      backgroundColor: theme.palette.background.default,
      width: "100%"
    },
    mainLogo: {
      marginTop: 20,
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    listItemGutters: {
      padding: `8px 20px`
    },
    listItem: {
      height: 42,
      background: "red"
    },
    scrollBar: {
      height: "100%",
      overflowY: "auto"
    },
    scrollBarLg: {
      overflowY: "hidden"
    },
    navigationLink: {
      display: "flex",
      width: "100%",
      height: "100%"
    },
    linkActive: {
      backgroundColor: theme.palette.gray["200"]
    },
    avatarSection: {
      position: "absolute",
      bottom: 0,
      padding: theme.spacing(1.5),
      width: "100%",
      background: theme.palette.gray["200"],
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center"
    },

    orderButton: {
      margin: "30px 20px 20px 10px",
      width: 230
    },
    switchBody: {
      margin: "35px 20px 0px 20px",
      width: 220,
      borderRadius: "5px",
      background: theme.palette.gray[300],
      height: "60px",
      padding: "15px",
      paddingTop: "11px",
      cursor: "pointer"
    },
    selectedIcon: {
      color: theme.palette.primary.main
    },
    badge: {
      background: theme.palette.primary.main,
      borderRadius: "6px",
      padding: "4px",
      width: "20px",
      color: "white",
      textAlign: "center",
      height: "20px",
      fontSize: "10px",
      marginLeft: "auto"
    },
    flex: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%"
    },
    switchDiv: {
      background: theme.palette.gray[200],
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingLeft: theme.spacing(0.5),
      paddingRight: theme.spacing(0.5),
      height: "35px"
    },
    envDiv: {
      color: theme.palette.text.secondary,
      width: "100%",
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5)
    },
    active: {
      padding: theme.spacing(0.5),
      background: theme.palette.primary.main,
      borderRadius: "6px",
      color: "white",
      cursor: "pointer",
      width: "100px",
      textAlign: "center"
    },
    notActive: {
      width: "100px",
      textAlign: "center",
      cursor: "pointer",
      marginRight: "5px"
    },
    drawerPaper: {
      width: 240
    },
    adminSection: {
      paddingBottom: theme.spacing(15)
    },

    storeOption: {
      display: "flex",
      height: "40px",
      alignItems: "center",
      width: "100%"
    },
    storeLogo: {
      padding: "3%",
      borderRadius: "100px",
      backgroundColor: theme.palette.gray[200]
    },
    storeName: {
      padding: "5%",
      width: "100%"
    },
    storeSubHeading: {
      fontSize: "12px",
      color: "black",
      marginTop: "3px"
    },
    storeHeading: {
      color: "black",
      marginBottom: "0px"
    },
    small: {
      width: theme.spacing(4),
      height: theme.spacing(4)
    },
    brandDropdown: {
      backgroundColor: "#E2E8F0"
    },
    userMenuIcons: {
      color: theme.palette.gray[400]
    },
    root: {
      height: "calc(100vh - 22em)"
    }
  })
);

const Sidebar: React.FC = () => {
  const matches = useMediaQuery("(min-width:1710px)");
  const { pathname } = useLocation();
  const classes = useStyles();
  const navigate = useNavigate();
  const { user, logout } = React.useContext(UserContext);
  const { setDrawerOpen } = React.useContext(DrawerContext);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [searchParams] = useSearchParams();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const [mode, setMode] = React.useState<string>("staging");

  const { handleSave, handleModalOpen, handleModalClose, modalOpen } = useModal({
    onSave: () => null
  });

  return (
    <div>
      <div className={classes.drawer}>
        <div>
          <>
            <Link to="/" className={classes.mainLogo} aria-label="advocacy logo">
              <AdvocacyIcon />
            </Link>
            <div style={{ width: "90%", margin: "auto" }}>
              <BrandPoper />
            </div>

            <Button
              variant="contained"
              startIcon={<OrdersIconWhite />}
              className={classes.orderButton}
              onClick={() => {
                setDrawerOpen(false);
                if (pathname.startsWith("/take-order")) {
                  navigate({ pathname: "/take-order", search: searchParams.toString() });
                } else {
                  navigate("/take-order");
                }
              }}
            >
              Take Order
            </Button>
            <div className={classes.root}>
              <div className={matches ? classes.scrollBarLg : classes.scrollBar}>
                <List>
                  {navLinks.map(({ to, title, Icon }) => (
                    <ListItemButton
                      key={title}
                      classes={{
                        gutters: classes.listItemGutters,
                        selected: classes.linkActive
                      }}
                      className={`${classes.listItem}`}
                      selected={to === "/" ? pathname === to : pathname.startsWith(to)}
                      onClick={() => {
                        setDrawerOpen(false);
                        if (pathname.startsWith(to)) {
                          navigate({ pathname: to, search: searchParams.toString() });
                        } else {
                          navigate(to);
                        }
                      }}
                    >
                      <ListItemIcon>
                        <Icon color={to === pathname ? "red" : "gray"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="subtitle1">{title}</Typography>}
                      >
                        {title}
                      </ListItemText>
                    </ListItemButton>
                  ))}
                </List>
                {/* Admin Section */}
                <List>
                  <ListItem key="Admin">
                    <Typography variant="body1">Admin</Typography>
                  </ListItem>
                  {adminLinks.map(({ to, title, Icon, disabled }, index) => (
                    <ListItem
                      button
                      key={title}
                      disabled={disabled}
                      classes={{
                        gutters: classes.listItemGutters
                      }}
                      className={`${classes.listItem} ${
                        pathname.startsWith(to) ? classes.linkActive : ""
                      }`}
                      onClick={() => {
                        if (pathname.startsWith(to)) {
                          navigate({ pathname: to, search: searchParams.toString() });
                        } else {
                          navigate(to);
                        }
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <Icon color={to === pathname ? "red" : "gray"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="subtitle1">{title}</Typography>}
                      >
                        {title}
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
                {/* Admin Section */}
                {/* Others Section */}
                <List className={classes.adminSection}>
                  <ListItem key="Others">
                    <Typography variant="body1">Others</Typography>
                  </ListItem>
                  {otherLinks.map(({ to, title, Icon }, index) => (
                    <ListItem
                      button
                      key={title}
                      classes={{
                        gutters: classes.listItemGutters
                      }}
                      className={`${classes.listItem} ${
                        pathname.startsWith(to) ? classes.linkActive : ""
                      }`}
                      onClick={() => {
                        if (pathname.startsWith(to)) {
                          navigate({ pathname: to, search: searchParams.toString() });
                        } else {
                          navigate(to);
                        }
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemIcon>
                        <Icon color={to === pathname ? "red" : "gray"} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="subtitle1">{title}</Typography>}
                      >
                        {title}
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
                {/* Admin Section */}
              </div>
            </div>
          </>
        </div>
        <div className={classes.avatarSection} aria-label="sidebar drawer">
          <Avatar
            // src={placeholderSvg}
            imgProps={{
              "aria-label": "user avatar",
              alt: "user avatar"
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              marginLeft: 12,
              width: "60%"
            }}
          >
            <Typography
              aria-label="username"
              variant="body1"
              className={classes.truncate}
            >
              {user.first_name} {user.last_name}
            </Typography>
            <Typography
              aria-label="user email"
              variant="body2"
              className={classes.truncate}
            >
              {user.email}
            </Typography>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
          </div>

          <Popover
            style={{ marginTop: "-65px", marginLeft: "-75px", maxWidth: "270px" }}
            id="simple-popover"
            aria-label="drawer popover"
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "center"
            }}
          >
            <MenuList style={{ paddingTop: 10, paddingBottom: 10 }}>
              <MenuItem aria-label="profile">
                <ListItemIcon>
                  <MuiIcons icon="user" className={classes.userMenuIcons} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle1">Profile</Typography>}
                >
                  Profile
                </ListItemText>
              </MenuItem>
              <MenuItem aria-label="help & support" onClick={() => handleClose()}>
                <ListItemIcon>
                  <MuiIcons icon="help" className={classes.userMenuIcons} />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle1">Help & Support</Typography>}
                >
                  Help & Support
                </ListItemText>
              </MenuItem>
              <MenuItem
                aria-label="switch organization"
                onClick={() => {
                  handleModalOpen();
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <OrganizationsIcon color="gray" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">Switch Organization</Typography>
                  }
                >
                  Switch Organization
                </ListItemText>
              </MenuItem>
              <hr />
              <div className={classes.envDiv}>
                <div className={classes.flex}>
                  <p>Switch Environment</p>
                  <p>V 0.0.1</p>
                </div>
                <div className={classes.switchDiv}>
                  <p
                    className={mode === "production" ? classes.active : classes.notActive}
                    onClick={() => setMode("production")}
                  >
                    Production
                  </p>
                  <p
                    className={mode === "staging" ? classes.active : classes.notActive}
                    onClick={() => setMode("staging")}
                  >
                    Staging
                  </p>{" "}
                  <p
                    className={mode === "dev" ? classes.active : classes.notActive}
                    onClick={() => setMode("dev")}
                  >
                    Dev
                  </p>{" "}
                </div>
              </div>
              <hr />
              <MenuItem onClick={() => logout()} aria-label="logout">
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary={<Typography variant="subtitle1">Logout</Typography>}
                >
                  Logout
                </ListItemText>
              </MenuItem>
            </MenuList>
          </Popover>
        </div>
      </div>

      <SwitchOrgModal
        saveText="Confirm Switch"
        title="Switch Organization"
        handleSaveChanges={handleSave}
        handleCloseModal={handleModalClose}
        openModal={modalOpen}
      />
    </div>
  );
};

export default Sidebar;
