import React, { useState } from "react";
import {
    AppBar, Toolbar, Drawer, IconButton, Typography,
    CssBaseline, Box, List, ListItem, ListItemIcon, ListItemText,
    useMediaQuery, useTheme, Divider
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LogoutIcon from "@mui/icons-material/Logout";
import { Outlet, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../context/AuthContext";
import EventIcon from '@mui/icons-material/Event';

const drawerWidth = 240;

const DashboardLayout = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <Toolbar />
            <List>
                <ListItem button onClick={() => navigate("/app")} style={{ cursor: "pointer" }}>
                    <ListItemIcon>
                        <DashboardIcon sx={{ color: "var(--beige-dark)" }} />
                    </ListItemIcon>
                    <ListItemText  primary="Inicio" />
                </ListItem>
                  <ListItem button  onClick={() => navigate("/app/event")}  style={{ cursor: "pointer" }}>
                    <ListItemIcon>
                        <EventIcon sx={{ color: "var(--beige-dark)" }} />
                    </ListItemIcon>
                    <ListItemText primary="Eventos" />
                </ListItem>
                <ListItem button  onClick={() => navigate("/app/create-invitation")}  style={{ cursor: "pointer" }}>
                    <ListItemIcon>
                        <AddIcon sx={{ color: "var(--beige-dark)" }} />
                    </ListItemIcon>
                    <ListItemText primary="Crear Invitación" />
                </ListItem>
                <ListItem button onClick={() => navigate("/app/confirmaciones")} style={{ cursor: "pointer" }}>
                    <ListItemIcon>
                        <EventAvailableIcon sx={{ color: "var(--beige-dark)" }} />
                    </ListItemIcon>
                    <ListItemText primary="Confirmaciones" />
                </ListItem>
                <ListItem button onClick={() => navigate("/app/send-invitation")} style={{ cursor: "pointer" }}>
                    <ListItemIcon>
                        <SendIcon sx={{ color: "var(--beige-dark)" }} />
                    </ListItemIcon>
                    <ListItemText  primary="Enviar Invitaciones" />
                </ListItem>
                <ListItem button  onClick={() => navigate("/app/setting")} style={{ cursor: "pointer" }}>
                    <ListItemIcon>
                        <SettingsIcon sx={{ color: "var(--beige-dark)" }} />
                    </ListItemIcon>
                    <ListItemText  primary="Configuración" />
                </ListItem>
                <Divider sx={{ my: 1 }} />
                <ListItem
                    button
                    onClick={() => {
                        Swal.fire({
                            title: "¿Quieres cerrar sesión?",
                            text: "Regresarás a la pantalla de inicio.",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Sí",
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    title: "Cerrando sesión",
                                    text: "Has cerrado sesión.",
                                    icon: "success",
                                    timer: 1500,
                                    showConfirmButton: false,
                                }).then(() => {
                                    logout();
                                });
                            }
                        });
                    }}
                    style={{ cursor: "pointer" }}
                >
                    <ListItemIcon>
                        <LogoutIcon sx={{ color: "var(--beige-dark)" }} />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: 1201, backgroundColor: "var(--beige-dark)" }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        SGID - Sistema de Generación de Invitaciones Digitales
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: "none", sm: "block" },
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: "block", sm: "none" },
                    [`& .MuiDrawer-paper`]: {
                        width: drawerWidth,
                    },
                }}
            >
                {drawer}
            </Drawer>

            <Box component="main"
                sx={{
                    flexGrow: 1,
                    width: { sm: `calc(100% - ${drawerWidth}px)` }, 
                    ml: { sm: `${drawerWidth}px` },
                }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayout;
