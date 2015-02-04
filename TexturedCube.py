#! /usr/bin/env python
# -*- coding: utf8 -*-
"""Port of NeHe Lesson 16 by Ivan Izuver <izuver@users.sourceforge.net>"""
from OpenGL.GL import *
from OpenGL.GLUT import *
from OpenGL.GLU import *
import sys
from Image import *

window = 0
texture = 0
xrot = yrot = zrot = 0.0

fogColor=(0.5, 0.5, 0.5, 1.0) # fog color

def LoadTextures():
    #global texture
    image = open("ground.jpg")
    
    ix = image.size[0]
    iy = image.size[1]
    image = image.tostring("raw", "RGBX", 0, -1)
    
    # Create Texture    
    glBindTexture(GL_TEXTURE_2D, glGenTextures(1))   # 2d texture (x and y size)
    
    glPixelStorei(GL_UNPACK_ALIGNMENT,1)
    glTexImage2D(GL_TEXTURE_2D, 0, 3, ix, iy, 0, GL_RGBA, GL_UNSIGNED_BYTE, image)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST)
    glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_DECAL)

# A general OpenGL initialization function.  Sets all of the initial parameters. 
def InitGL(Width, Height):                # We call this right after our OpenGL window is created.
    LoadTextures()
    glEnable(GL_TEXTURE_2D)
    glClearColor(0.0, 0.0, 0.0, 0.0)    # This Will Clear The Background Color To Black
    glClearDepth(1.0)                    # Enables Clearing Of The Depth Buffer
    glDepthFunc(GL_LESS)                # The Type Of Depth Test To Do
    glEnable(GL_DEPTH_TEST)                # Enables Depth Testing
    glShadeModel(GL_SMOOTH)                # Enables Smooth Color Shading
    
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()                    # Reset The Projection Matrix
                                        # Calculate The Aspect Ratio Of The Window
    gluPerspective(45.0, float(Width)/float(Height), 0.1, 100.0)
    glMatrixMode(GL_MODELVIEW)

# The function called when our window is resized (which shouldn't happen if you enable fullscreen, below)
def ReSizeGLScene(Width, Height):
    if Height == 0:                        # Prevent A Divide By Zero If The Window Is Too Small 
        Height = 1

    glViewport(0, 0, Width, Height)        # Reset The Current Viewport And Perspective Transformation
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    gluPerspective(45.0, float(Width)/float(Height), 0.1, 100.0)
    glMatrixMode(GL_MODELVIEW)

# The main drawing function. 
def DrawGLScene():
    global xrot, yrot, zrot, texture

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)    # Clear The Screen And The Depth Buffer
    glLoadIdentity()                    # Reset The View
    
    glClearColor(0.3,0.3,0.3,1.0)            
    
    glEnable(GL_FOG)                         # Enable fog
    
    glFogi(GL_FOG_MODE, GL_LINEAR)           # Set fog settings
    
    glFogfv(GL_FOG_COLOR, fogColor);         # Set fog color
    
    glFogf(GL_FOG_DENSITY, 0.45);            # Set fog density
    
    glHint(GL_FOG_HINT, GL_DONT_CARE);       # Set Hint
    
    glFogf(GL_FOG_START, -10.0);               # Fog start 
    
    glFogf(GL_FOG_END, 10.0);                 # Fog end

    
    glTranslatef(0.0,0.0,-5.0)            # Move Into The Screen

    glRotatef(xrot,1.0,0.0,0.0)            # Rotate The Cube On It's X Axis
    glRotatef(yrot,0.0,1.0,0.0)            # Rotate The Cube On It's Y Axis
    glRotatef(zrot,0.0,0.0,1.0)            # Rotate The Cube On It's Z Axis
    
    # Note there does not seem to be support for this call.
    #glBindTexture(GL_TEXTURE_2D,texture)    # Rotate The Pyramid On It's Y Axis

    glBegin(GL_QUADS)                # Start Drawing The Cube
    
    # Front Face (note that the texture's corners have to match the quad's corners)
    glTexCoord2f(0.0, 0.0); glVertex3f(-1.0, -1.0,  1.0)    # Bottom Left Of The Texture and Quad
    glTexCoord2f(1.0, 0.0); glVertex3f( 1.0, -1.0,  1.0)    # Bottom Right Of The Texture and Quad
    glTexCoord2f(1.0, 1.0); glVertex3f( 1.0,  1.0,  1.0)    # Top Right Of The Texture and Quad
    glTexCoord2f(0.0, 1.0); glVertex3f(-1.0,  1.0,  1.0)    # Top Left Of The Texture and Quad
    
    # Back Face
    glTexCoord2f(1.0, 0.0); glVertex3f(-1.0, -1.0, -1.0)    # Bottom Right Of The Texture and Quad
    glTexCoord2f(1.0, 1.0); glVertex3f(-1.0,  1.0, -1.0)    # Top Right Of The Texture and Quad
    glTexCoord2f(0.0, 1.0); glVertex3f( 1.0,  1.0, -1.0)    # Top Left Of The Texture and Quad
    glTexCoord2f(0.0, 0.0); glVertex3f( 1.0, -1.0, -1.0)    # Bottom Left Of The Texture and Quad
    
    # Top Face
    glTexCoord2f(0.0, 1.0); glVertex3f(-1.0,  1.0, -1.0)    # Top Left Of The Texture and Quad
    glTexCoord2f(0.0, 0.0); glVertex3f(-1.0,  1.0,  1.0)    # Bottom Left Of The Texture and Quad
    glTexCoord2f(1.0, 0.0); glVertex3f( 1.0,  1.0,  1.0)    # Bottom Right Of The Texture and Quad
    glTexCoord2f(1.0, 1.0); glVertex3f( 1.0,  1.0, -1.0)    # Top Right Of The Texture and Quad
    
    # Bottom Face       
    glTexCoord2f(1.0, 1.0); glVertex3f(-1.0, -1.0, -1.0)    # Top Right Of The Texture and Quad
    glTexCoord2f(0.0, 1.0); glVertex3f( 1.0, -1.0, -1.0)    # Top Left Of The Texture and Quad
    glTexCoord2f(0.0, 0.0); glVertex3f( 1.0, -1.0,  1.0)    # Bottom Left Of The Texture and Quad
    glTexCoord2f(1.0, 0.0); glVertex3f(-1.0, -1.0,  1.0)    # Bottom Right Of The Texture and Quad
    
    # Right face
    glTexCoord2f(1.0, 0.0); glVertex3f( 1.0, -1.0, -1.0)    # Bottom Right Of The Texture and Quad
    glTexCoord2f(1.0, 1.0); glVertex3f( 1.0,  1.0, -1.0)    # Top Right Of The Texture and Quad
    glTexCoord2f(0.0, 1.0); glVertex3f( 1.0,  1.0,  1.0)    # Top Left Of The Texture and Quad
    glTexCoord2f(0.0, 0.0); glVertex3f( 1.0, -1.0,  1.0)    # Bottom Left Of The Texture and Quad
    
    # Left Face
    glTexCoord2f(0.0, 0.0); glVertex3f(-1.0, -1.0, -1.0)    # Bottom Left Of The Texture and Quad
    glTexCoord2f(1.0, 0.0); glVertex3f(-1.0, -1.0,  1.0)    # Bottom Right Of The Texture and Quad
    glTexCoord2f(1.0, 1.0); glVertex3f(-1.0,  1.0,  1.0)    # Top Right Of The Texture and Quad
    glTexCoord2f(0.0, 1.0); glVertex3f(-1.0,  1.0, -1.0)    # Top Left Of The Texture and Quad
    
    glEnd();                # Done Drawing The Cube
    
    xrot  = xrot + 0.2                # X rotation
    yrot = yrot + 0.2                 # Y rotation
    zrot = zrot + 0.2                 # Z rotation

    #  since this is double buffered, swap the buffers to display what just got drawn. 
    glutSwapBuffers()

def keyPressed(*args):
    sys.exit()

def main():
    global window
    glutInit(sys.argv)

    glutInitDisplayMode(GLUT_RGBA | GLUT_DOUBLE | GLUT_DEPTH)
    glutInitWindowSize(640, 480)
    glutInitWindowPosition(0, 0)
    
    window = glutCreateWindow("Magic")

    glutDisplayFunc(DrawGLScene)
    
    # glutFullScreen()

    glutIdleFunc(DrawGLScene)
    
    # Register the function called when our window is resized.
    glutReshapeFunc(ReSizeGLScene)
    
    # Register the function called when the keyboard is pressed.  
    glutKeyboardFunc(keyPressed)

    # Initialize our window. 
    InitGL(640, 480)

    glutMainLoop()

if __name__ == "__main__":
    main()
       