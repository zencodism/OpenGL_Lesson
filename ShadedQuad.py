#! /usr/bin/env python
# -*- coding: utf8 -*-

import sys
from ctypes import *
from Image import *
try:
    # For OpenGL-ctypes
    from OpenGL import platform
    gl = platform.OpenGL
except ImportError:
    try:
        # For PyOpenGL
        gl = cdll.LoadLibrary('libGL.so')
    except OSError:
        # Load for Mac
        from ctypes.util import find_library
        # finds the absolute path to the framework
        path = find_library('OpenGL')
        gl = cdll.LoadLibrary(path)

from OpenGL.GL import *
from OpenGL.GLU import *
from OpenGL.GLUT import *
glCreateShader = gl.glCreateShader
glShaderSource = gl.glShaderSource
glShaderSource.argtypes = [c_int, c_int, POINTER(c_char_p), POINTER(c_int)]
glCompileShader = gl.glCompileShader
glGetShaderiv = gl.glGetShaderiv
glGetShaderiv.argtypes = [c_int, c_int, POINTER(c_int)]
glGetShaderInfoLog = gl.glGetShaderInfoLog
glGetShaderInfoLog.argtypes = [c_int, c_int, POINTER(c_int), c_char_p]
glDeleteShader = gl.glDeleteShader
glCreateProgram = gl.glCreateProgram
glAttachShader = gl.glAttachShader
glLinkProgram = gl.glLinkProgram
glGetError = gl.glGetError
glUseProgram = gl.glUseProgram

window = 0
texture = 0

GL_FRAGMENT_SHADER = 0x8B30
GL_VERTEX_SHADER = 0x8B31
GL_COMPILE_STATUS = 0x8B81
GL_LINK_STATUS = 0x8B82
GL_INFO_LOG_LENGTH = 0x8B84

def compile_shader(source, shader_type):
    shader = glCreateShader(shader_type)
    source = c_char_p(source)
    length = c_int(-1)
    glShaderSource(shader, 1, byref(source), byref(length))
    glCompileShader(shader)
    
    status = c_int()
    glGetShaderiv(shader, GL_COMPILE_STATUS, byref(status))
#    if not status.value:
#        print_log(shader)
#        glDeleteShader(shader)
#        raise ValueError, 'Shader compilation failed'
    return shader
 
def compile_program(vertex_source, fragment_source):
    vertex_shader = None
    fragment_shader = None
    program = glCreateProgram()
 
    if vertex_source:
        vertex_shader = compile_shader(vertex_source, GL_VERTEX_SHADER)
        glAttachShader(program, vertex_shader)
    if fragment_source:
        fragment_shader = compile_shader(fragment_source, GL_FRAGMENT_SHADER)
        glAttachShader(program, fragment_shader)
 
    glLinkProgram(program)
 
    if vertex_shader:
        glDeleteShader(vertex_shader)
    if fragment_shader:
        glDeleteShader(fragment_shader)
 
    return program
 
def print_log(shader):
    length = c_int()
    glGetShaderiv(shader, GL_INFO_LOG_LENGTH, byref(length))
 
    if length.value > 0:
        log = create_string_buffer(length.value)
        glGetShaderInfoLog(shader, length, byref(length), log)
        print log.value

def LoadTextures():
    image = open("ground.jpg")
    
    ix = image.size[0]
    iy = image.size[1]
    image = image.tostring("raw", "RGBX", 0, -1)
    
    glBindTexture(GL_TEXTURE_2D, glGenTextures(1))
    glTexImage2D(GL_TEXTURE_2D, 0, 3, ix, iy, 0, GL_RGBA, GL_UNSIGNED_BYTE, image)
    glPixelStorei(GL_UNPACK_ALIGNMENT,1)
    
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST)
    glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST)
    glTexEnvf(GL_TEXTURE_ENV, GL_TEXTURE_ENV_MODE, GL_DECAL)

program = compile_program('''
    // Vertex program
    varying vec3 pos;
    void main() {
        pos = gl_Vertex.xyz;
        gl_Position = gl_ModelViewProjectionMatrix * gl_Vertex;
    }
    ''', '''
    // Fragment program
    //varying vec3 pos;
    void main() {
        gl_FragColor.rgb = pos.xyz;
    }
    ''')

def InitGL(Width, Height):
    glEnable(GL_TEXTURE_2D)
    glClearColor(0.0, 0.0, 0.0, 0.0)    # This Will Clear The Background Color To Black
    glClearDepth(1.0)                    # Enables Clearing Of The Depth Buffer
    glDepthFunc(GL_LESS)                # The Type Of Depth Test To Do
    glEnable(GL_DEPTH_TEST)                # Enables Depth Testing
    glShadeModel(GL_SMOOTH)                # Enables Smooth Color Shading
    glEnable(GL_BLEND)
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
        
    glUseProgram(program)
    
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()                    # Reset The Projection Matrix
                                        # Calculate The Aspect Ratio Of The Window
    gluPerspective(45.0, float(Width)/float(Height), 0.1, 100.0)
    glMatrixMode(GL_MODELVIEW)
    LoadTextures()

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
    
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)    # Clear The Screen And The Depth Buffer
    glLoadIdentity()                    # Reset The View
    glUseProgram(program)
    glClearColor(0.3,0.3,0.3,1.0)            
    glTranslatef(0.0,0.0,-4.0)
    
    glBegin(GL_QUADS)
    
    glTexCoord2f(0.0, 0.0); glVertex3f(-1.0, -1.0,  1.0)    # Bottom Left Of The Texture and Quad
    glTexCoord2f(1.0, 0.0); glVertex3f( 1.0, -1.0,  1.0)    # Bottom Right Of The Texture and Quad
    glTexCoord2f(1.0, 1.0); glVertex3f( 1.0,  1.0,  1.0)    # Top Right Of The Texture and Quad
    glTexCoord2f(0.0, 1.0); glVertex3f(-1.0,  1.0,  1.0)    # Top Left Of The Texture and Quad
    
    glEnd();
    
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
    glutIdleFunc(DrawGLScene)
    glutReshapeFunc(ReSizeGLScene)
    glutKeyboardFunc(keyPressed)

    # Initialize our window. 
    # glutFullScreen()
    InitGL(640, 480)

    glutMainLoop()

if __name__ == "__main__":
    main()
       