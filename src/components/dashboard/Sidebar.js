import Link from 'next/link';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { NAV_ITEMS } from './NavItems';
import styles from '@/styles/sidebar/Sidebar.module.scss';

export const SIDEBAR_WIDTH = 240;

const Sidebar = () => {
  const userRole = 'general-manager';

  return (
    <Drawer
      variant="permanent"
      PaperProps={{
        className: styles.sidebar,
      }}
      sx={{ width: SIDEBAR_WIDTH, flexShrink: 0 }}
    >
      <List>
        {NAV_ITEMS
          .filter(item => item.roles.includes(userRole))
          .map(item => (
            <ListItem disablePadding key={item.label}>
              <Link href={item.path} passHref legacyBehavior>
                <ListItemButton component="a">
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
